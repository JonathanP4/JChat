import { Auth } from "@/store/Auth";
import { Input } from "@/components/Input";
import { Message } from "@/components/Message";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { FlatList, Pressable, View, Platform, Image } from "react-native";
import database from "@react-native-firebase/database";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

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
	content: string
) {
	const message = {
		to: expoPushToken,
		sound: "default",
		title: `You've got a message from ${username}!`,
		body: `${content}`,
		data: { someData: "goes here" },
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
	const [messages, setMessages] = useState<any>([]);
	const [text, setText] = useState("");
	const [contactExpoPushToken, setContactExpoPushToken] = useState("");

	const notificationListener = useRef<Notifications.Subscription>();
	const responseListener = useRef<Notifications.Subscription>();

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
			.ref(`/users/${user.uid}/chats/${id}`)
			.orderByValue()
			.on("value", (snap) => {
				if (!snap.exists()) return setMessages([]);

				const msgs = snap.val();
				const data: Message[] = [];

				Object.keys(msgs).map((k) => {
					msgs[k].id = k;
					data.push(msgs[k]);
				});
				setMessages(data.sort((a, b) => (a.datetime < b.datetime ? -1 : 0)));
			});
	}, []);

	const changeText = (t: string) => {
		setText(t);
	};

	const sendMsg = async () => {
		const datetime = new Date().toISOString();
		const userData = {
			userID: user?.uid,
			name: user?.displayName,
			photo: user?.photoURL,
		};
		if (!user) return;

		const key = database().ref(`users/${user.uid}/chats/${id}`).push().key;

		database()
			.ref(`users/${user.uid}/chats/${id}/${key}`)
			.set({ message: text, datetime, ...userData });

		database()
			.ref(`users/${id}/chats/${user.uid}/${key}`)
			.set({ message: text, datetime, ...userData });

		await sendPushNotification(contactExpoPushToken, user!.displayName!, text);
		setText("");
	};

	return (
		<View className="flex-1 bg-slate-900 p-2">
			<FlatList
				className="flex-1"
				data={messages}
				keyExtractor={(item, idx) => `${item.id}${idx}`}
				renderItem={({ item }) => <Message contactID={id} message={item} />}
			/>

			<View className="flex-row items-center">
				<Input
					styles="rounded-l ml-1 flex-1"
					placeholder="Write a message..."
					value={text}
					changeText={changeText}
				/>
				<Pressable onPress={sendMsg} className="bg-slate-600 p-2 rounded-r">
					<Ionicons name="send" size={20} color={"white"} />
				</Pressable>
			</View>
		</View>
	);
}
