import { Auth } from "@/store/Auth";
import { Entypo, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import database from "@react-native-firebase/database";
import storage from "@react-native-firebase/storage";
import { Audio } from "expo-av";
import { Video } from "./Video";
import { Href, Link } from "expo-router";
import { DateTime } from "luxon";
import * as Clipboard from "expo-clipboard";

type Props = {
	message: Message;
	contactID: string | string[];
	editing: Message | null;
	index: number;
	flatListRef: any;
	reply: (index: number, msg: Message) => void;
	editMessage: (index: number, msg: Message) => void;
};

export function Message({
	message,
	contactID,
	editing,
	index,
	flatListRef,
	reply,
	editMessage,
}: Props) {
	const { user } = Auth();
	const [sound, setSound] = useState<Audio.Sound>();
	const [playing, setPlaying] = useState(false);
	const [isFromCurrentUser, setIsFromCurrentUser] = useState(false);
	const [popupShown, setShowPopup] = useState(false);
	const viewRef = useRef(null);

	const dateMsg = DateTime.fromISO(message.datetime).toLocaleString(
		DateTime.DATETIME_MED
	);

	useEffect(() => {
		setIsFromCurrentUser(message.userID === user?.uid);
	}, []);

	useEffect(() => {
		return sound
			? () => {
					sound.unloadAsync();
			  }
			: undefined;
	}, [sound]);

	const deleteMessage = () => {
		if (!user) return;
		database()
			.ref(`users/${user.uid}/chats/${user.uid}-${contactID}/${message.id}`)
			.set(null);
		database()
			.ref(`users/${contactID}/chats/${contactID}-${user.uid}/${message.id}`)
			.set(null);
		if (message.media) {
			const reference = storage().ref(
				`media/${user.uid}/${message.media.filename}`
			);
			reference.delete();
		}
	};

	const playSound = async () => {
		if (!message.media?.url) return;
		const { sound } = await Audio.Sound.createAsync({
			uri: message.media?.url,
		});
		setSound(sound);
		setPlaying(true);
		await sound.playAsync();
		setTimeout(stopSound, +message.media.width);
	};

	const stopSound = async () => {
		await sound?.stopAsync();
		setPlaying(false);
	};

	const scrollToMessage = () => {
		flatListRef.current.scrollToIndex({
			index: message.replying!.index + 1,
			viewPosition: 1,
		});
	};

	const copyMessage = async () => {
		if (message.message) {
			await Clipboard.setStringAsync(message.message);
			setShowPopup(true);
			setTimeout(() => setShowPopup(false), 2000);
		}
	};

	return (
		<View
			ref={viewRef}
			className={`${
				editing?.id === message.id ? "bg-slate-700" : ""
			} border border-b-slate-700`}
		>
			{popupShown && (
				<View className="absolute top-0 right-0 bg-slate-700 p-3 rounded-md z-20">
					<Text className="text-white">Message copied</Text>
				</View>
			)}
			{message.replying && (
				<Pressable
					onPress={scrollToMessage}
					className="bg-slate-500 flex-row items-center mb-1 pl-1"
				>
					<FontAwesome5 size={20} name="replyd" color={"white"} />
					<Text numberOfLines={1} className="text-white/70 ml-2">
						{message.replying.message || message.replying.media?.filename}
					</Text>
				</Pressable>
			)}
			<View className="p-2">
				<View className="flex-row items-start">
					<Image
						className="rounded-full mr-3"
						width={40}
						height={40}
						source={{ uri: message.photo }}
					/>

					<View className="flex-row flex-1 justify-between items-center">
						<Text className="text-white font-extrabold text-lg">
							{message.name}
						</Text>
						<View className="flex-row items-center">
							{isFromCurrentUser && (
								<>
									<Pressable className="px-2" onPress={deleteMessage}>
										<Entypo size={17} color={"red"} name="trash" />
									</Pressable>
									{message.message && (
										<Pressable
											className="px-2"
											onPress={() => editMessage(index, message)}
										>
											<Entypo size={17} color={"#4287f5"} name="pencil" />
										</Pressable>
									)}
								</>
							)}
							<Pressable
								onPressIn={() => reply(index, message)}
								className="px-2"
							>
								<Entypo size={17} color={"white"} name="reply" />
							</Pressable>
						</View>
					</View>
				</View>
				<Pressable
					onLongPress={copyMessage}
					className="ml-[53px] max-w-[290px] -mt-2 mb-2 relative"
				>
					{!message.media && (
						<Text className="text-white/80 text-base">{message.message}</Text>
					)}
					{message.media && message.media.type === "image" && (
						<View className="p-2 bg-slate-500 rounded-md mt-2 self-start">
							<Link
								href={message.media.url as Href}
								className="absolute z-10 top-3 right-3"
							>
								<Ionicons size={20} name="link" color={"white"} />
							</Link>
							<Image
								width={300}
								height={200}
								source={{ uri: message.media.url }}
							/>
						</View>
					)}
					{message.media && message.media.type === "video" && (
						<View className="rounded-md self-start">
							<Link
								href={message.media.url as Href}
								className="absolute z-10 top-3 right-3"
							>
								<Ionicons size={20} name="link" color={"white"} />
							</Link>
							<Video videoUrl={message.media.url} />
						</View>
					)}
					{message.media && message.media.type === "audio" && (
						<View className="flex-row items-center mt-1">
							<Text className="text-white bg-slate-700 py-1 rounded-l-full border border-slate-700 px-3">
								{`${
									+message.media!.width / 1000 >= 60
										? (+message.media!.width / 1000 / 60).toFixed()
										: (+message.media!.width / 1000).toFixed()
								}.${((+message.media!.width / 1000) % 60).toFixed()}`}
								{+message.media.width / 1000 >= 60 ? "m" : "s"}
							</Text>
							<Pressable
								onPress={playing ? stopSound : playSound}
								className="px-6 py-1 bg-slate-500 rounded-r-full"
							>
								<Ionicons
									size={20}
									color={"white"}
									name={playing ? "pause" : "play"}
								/>
							</Pressable>
						</View>
					)}
				</Pressable>

				<Text className="text-slate-400 text-sm self-end">{dateMsg}</Text>
			</View>
		</View>
	);
}
