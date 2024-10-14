import { Auth } from "@/store/Auth";
import { Input } from "@/components/Input";
import { Message } from "@/components/Message";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Audio } from "expo-av";
import {
	FlatList,
	Pressable,
	View,
	Platform,
	Image,
	Text,
	Keyboard,
} from "react-native";
import database from "@react-native-firebase/database";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import storage from "@react-native-firebase/storage";

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: false,
		shouldSetBadge: false,
	}),
});

async function sendPushNotification(
	expoPushToken: string,
	username: string,
	content: string,
	contactID: string
) {
	const message = {
		to: expoPushToken,
		sound: "default",
		title: `You've got a message from ${username}!`,
		body: `${content}`,
		data: { url: `/(tabs)/chat/${contactID}` },
	};

	await fetch("https://exp.host/--/api/v2/push/send", {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Accept-encoding": "gzip, deflate",
			"Content-Type": "application/json",
		},
		body: JSON.stringify(message),
	});
}

function handleRegistrationError(errorMessage: string) {
	alert(errorMessage);
	throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
	if (Platform.OS === "android") {
		Notifications.setNotificationChannelAsync("default", {
			name: "default",
			importance: Notifications.AndroidImportance.MAX,
			vibrationPattern: [0, 250, 250, 250],
			lightColor: "#FF231F7C",
		});
	}

	if (Device.isDevice) {
		const { status: existingStatus } =
			await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;
		if (existingStatus !== "granted") {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
		}
		if (finalStatus !== "granted") {
			handleRegistrationError(
				"Permission not granted to get push token for push notification!"
			);
			return;
		}
		const projectId =
			Constants?.expoConfig?.extra?.eas?.projectId ??
			Constants?.easConfig?.projectId;
		if (!projectId) {
			handleRegistrationError("Project ID not found");
		}
	} else {
		handleRegistrationError("Must use physical device for push notifications");
	}
}

export default function ChatPage() {
	const { id } = useLocalSearchParams();
	const { user } = Auth();
	const navigation = useNavigation();

	const [contact, setContact] = useState<User>();
	const [contactMessages, setContactMessages] = useState<Message[] | null>(
		null
	);
	const [userMessages, setUserMessages] = useState<Message[] | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const [text, setText] = useState("");
	const [replying, setReplying] = useState<Message | null>(null);
	const [contactExpoPushToken, setContactExpoPushToken] = useState("");
	const [loadingImage, setLoadingImage] = useState(false);
	const [recording, setRecording] = useState<Audio.Recording>();
	const [permissionResponse, requestPermission] = Audio.usePermissions();

	const notificationListener = useRef<Notifications.Subscription>();
	const responseListener = useRef<Notifications.Subscription>();
	const inputRef = useRef(null);
	const flatListRef = useRef(null);

	useEffect(() => {
		database()
			.ref(`/users/${id}`)
			.once("value", (snap) => {
				if (snap.exists()) setContact(snap.val());
			});
		navigation.setOptions({
			headerTitle: contact?.username || "",
			headerLeft: () => (
				<Image
					className="rounded-full ml-3 -mr-1"
					width={35}
					height={35}
					source={{ uri: contact?.profile_picture || "https://" }}
				/>
			),
		});
	}, [navigation, contact]);

	useEffect(() => {
		registerForPushNotificationsAsync();

		notificationListener.current =
			Notifications.addNotificationReceivedListener((notification) => {
				console.log(notification);
			});

		responseListener.current =
			Notifications.addNotificationResponseReceivedListener((response) => {
				console.log(response);
			});

		return () => {
			notificationListener.current &&
				Notifications.removeNotificationSubscription(
					notificationListener.current
				);
			responseListener.current &&
				Notifications.removeNotificationSubscription(responseListener.current);
		};
	}, []);

	useEffect(() => {
		if (!user) return;

		database()
			.ref(`users/${id}`)
			.once("value", (snap) => {
				if (snap.exists()) {
					const value = snap.val() as User;
					setContactExpoPushToken(value.expo_push_token);
				}
			});

		database()
			.ref(`/users/${id}/chats/${user.uid}`)
			.on("value", (snap) => {
				if (!snap.exists()) return setContactMessages([]);

				const messages = snap.val();
				const data = Object.keys(messages).map((key) => {
					messages[key].id = key;
					return messages[key];
				});
				setContactMessages(data);
			});

		database()
			.ref(`/users/${user.uid}/chats/${id}`)
			.on("value", (snap) => {
				if (!snap.exists()) return setUserMessages([]);

				const messages = snap.val();
				const data = Object.keys(messages).map((key) => {
					messages[key].id = key;
					return messages[key];
				});
				setUserMessages(data);
			});
	}, []);

	useEffect(() => {
		if (!Array.isArray(contactMessages) || !Array.isArray(userMessages)) return;

		const allMessages = [...contactMessages, ...userMessages];
		setMessages(
			allMessages.sort((a, b) =>
				a.datetime > b.datetime ? 1 : a.datetime < b.datetime ? -1 : 0
			)
		);
	}, [userMessages, contactMessages]);

	const changeText = (t: string) => {
		setText(t);
	};

	const cancelReply = () => {
		if (inputRef.current) (inputRef.current as HTMLElement).blur();
		setReplying(null);
	};

	const sendMsg = async (media?: Media) => {
		const datetime = new Date().toISOString();
		const userData = {
			userID: user?.uid,
			name: user?.displayName,
			photo: user?.photoURL,
		};
		if (!user) return;

		if (media) {
			if (replying) {
				database()
					.ref(`users/${user.uid}/chats/${id}`)
					.push()
					.set({
						media,
						datetime,
						...userData,
						replyTo: { user: replying.name, message: replying.message },
					});
				cancelReply();
			} else {
				database()
					.ref(`users/${user.uid}/chats/${id}`)
					.push()
					.set({ media, datetime, ...userData });
			}
		} else {
			if (replying) {
				database()
					.ref(`users/${user.uid}/chats/${id}`)
					.push()
					.set({
						message: text,
						datetime,
						...userData,
						replyTo: { user: replying.name, message: replying.message },
					});
				cancelReply();
			} else {
				database()
					.ref(`users/${user.uid}/chats/${id}`)
					.push()
					.set({ message: text, datetime, ...userData });
			}
		}
		await sendPushNotification(
			contactExpoPushToken,
			user!.displayName!,
			text,
			user.uid as string
		);
		Keyboard.dismiss();
		setText("");
	};

	const replyMsg = (msg: Message) => {
		if (inputRef.current) (inputRef.current as HTMLElement).focus();
		setReplying(msg);
	};

	const pickImage = async () => {
		// No permissions request is necessary for launching the image library
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.All,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 1,
		});

		if (!result.canceled) {
			setLoadingImage(true);
			const img = result.assets[0];
			const url = "media/" + img.fileName!;
			const reference = storage().ref(url);
			await reference.putFile(img.uri);
			const downloadURL = await reference.getDownloadURL();
			setText(img.fileName || "");
			sendMsg({
				width: `${img.width}`,
				height: `${img.height}`,
				url: downloadURL,
				type: img.type,
				filename: img.fileName!,
			});
			setLoadingImage(false);
		}
	};

	const startRecording = async () => {
		try {
			if (permissionResponse!.status !== "granted") {
				await requestPermission();
			}
			await Audio.setAudioModeAsync({
				allowsRecordingIOS: true,
				playsInSilentModeIOS: true,
			});

			const { recording } = await Audio.Recording.createAsync(
				Audio.RecordingOptionsPresets.HIGH_QUALITY
			);
			setRecording(recording);
		} catch (err) {
			console.error("Failed to start recording", err);
		}
	};

	const stopRecording = async () => {
		setRecording(undefined);
		setLoadingImage(true);
		await recording!.stopAndUnloadAsync();
		await Audio.setAudioModeAsync({
			allowsRecordingIOS: false,
		});
		const uri = recording!.getURI()!;
		const { sound } = await Audio.Sound.createAsync({
			uri,
		});
		let duration = 0;
		sound
			?.getStatusAsync()
			.then((res) => (duration = (res as any).durationMillis));
		const reference = storage().ref("media/" + uri);
		await reference.putFile(uri);
		const url = await reference.getDownloadURL();
		const filename = uri.slice(-50);
		setText(filename);
		sendMsg({
			filename,
			height: "0",
			width: `${duration}`,
			type: "audio",
			url,
		});
		setLoadingImage(false);
	};

	return (
		<View className="bg-slate-900 flex-1">
			{loadingImage && (
				<View className="absolute left-0 right-0 top-2 flex-row justify-center">
					<Text className=" bg-slate-500 text-white font-bold z-20 p-2 px-6 rounded-md">
						Uploading media...
					</Text>
				</View>
			)}
			<FlatList
				ref={flatListRef}
				inverted
				className="flex-1"
				data={[...messages].reverse()}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<Message reply={replyMsg} contactID={id} message={item} />
				)}
			/>
			<View>
				{!!replying && (
					<View className="self-start flex-row">
						<Text
							numberOfLines={1}
							className="text-white bg-slate-600 rounded-full py-1 px-4 flex-1"
						>
							Replying to: "
							{replying.media ? replying.media.filename : replying.message}"
						</Text>
						<Pressable
							onPress={cancelReply}
							className="bg-red-600 rounded-full py-1 px-4 pl-12 -ml-10 -z-10 mr-10"
						>
							<Text className="text-white">Cancel</Text>
						</Pressable>
					</View>
				)}
				<View className="flex-row items-center">
					<Pressable
						className="bg-slate-600 py-2 pr-2 pl-3 border border-r-white"
						onPress={recording ? stopRecording : startRecording}
					>
						<Ionicons
							size={20}
							color={"white"}
							name={recording ? "pause" : "mic"}
						/>
					</Pressable>
					<Pressable
						onPress={pickImage}
						className="bg-slate-600 py-2 pr-2 pl-3"
					>
						<Ionicons size={20} color={"white"} name="image" />
					</Pressable>
					<Input
						ref={inputRef}
						styles="flex-1"
						placeholder="Write a message..."
						value={text}
						changeText={changeText}
					/>
					<Pressable onPress={() => sendMsg()} className="bg-slate-600 p-2">
						<Ionicons name="send" size={20} color={"white"} />
					</Pressable>
				</View>
			</View>
		</View>
	);
}
