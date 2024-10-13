import { Auth } from "@/store/Auth";
import { Entypo, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Button, Image, Pressable, Text, View } from "react-native";
import database from "@react-native-firebase/database";
import Video, { VideoRef } from "react-native-video";
import storage from "@react-native-firebase/storage";
import { Audio } from "expo-av";

type Props = {
	message: Message;
	contactID: string | string[];
	reply: (msg: Message) => void;
};

export function Message({ message, contactID, reply }: Props) {
	const { user } = Auth();
	const videoRef = useRef<VideoRef>(null);
	const [sound, setSound] = useState<Audio.Sound>();
	const [playing, setPlaying] = useState(false);
	const time = new Date(message.datetime).toLocaleTimeString("en-us", {
		timeStyle: "short",
	});
	const [isFromCurrentUser, setIsFromCurrentUser] = useState(false);

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
			.ref(`/users/${user.uid}/chats/${contactID}/${message.id}`)
			.set(null);
		if (message.media) {
			const reference = storage().ref("media/" + message.media.filename);
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

	return (
		<View className="px-2 pt-3 pb-2 border border-b-slate-700">
			{message.replyTo && (
				<View className="bg-slate-500 flex-row">
					<FontAwesome5 size={17} name="replyd" color={"white"} />
					<Text numberOfLines={1} className="text-white/70 ml-1">
						{message.media ? message.media.filename : message.replyTo.message}
					</Text>
				</View>
			)}
			<View className="flex-row justify-between items-start">
				<View className="flex-row">
					<Image
						className="rounded-full mr-3"
						width={40}
						height={40}
						source={{ uri: message.photo }}
					/>
					<View>
						<Text className="text-white font-bold text-base">
							{message.name}
						</Text>
						{!message.media && (
							<Text className="text-white">{message.message}</Text>
						)}
						{message.media && message.media.type === "image" && (
							<View className="p-2 bg-slate-500 rounded-md mt-2">
								<Image
									width={200}
									height={200}
									source={{ uri: message.media.url }}
								/>
							</View>
						)}
						{message.media && message.media.type === "video" && (
							<Video
								ref={videoRef}
								controls
								repeat
								style={{
									marginTop: 10,
									width: 260,
									height: 200,
								}}
								source={{
									uri: message.media.url,
								}}
							/>
						)}
						{message.media && message.media.type === "audio" && (
							<View className="flex-row items-center mt-1">
								<Text className="text-white bg-slate-700 py-1 rounded-full border border-slate-700 w-[70px] pl-3 -mr-6">
									{`${
										+message.media!.width / 1000 >= 60
											? (+message.media!.width / 1000 / 60).toFixed()
											: (+message.media!.width / 1000).toFixed()
									}.${((+message.media!.width / 1000) % 60).toFixed()}`}
									{+message.media.width / 1000 >= 60 ? "m" : "s"}
								</Text>
								<Pressable
									onPress={playing ? stopSound : playSound}
									className="px-6 py-1 bg-slate-500 rounded-full"
								>
									<Ionicons
										size={20}
										color={"white"}
										name={playing ? "pause" : "play"}
									/>
								</Pressable>
							</View>
						)}
					</View>
				</View>
				<View className="flex-row items-center">
					<Pressable onPressIn={() => reply(message)} className="px-2">
						<Entypo size={17} color={"white"} name="reply" />
					</Pressable>
					{isFromCurrentUser && (
						<Pressable className="px-2" onPress={deleteMessage}>
							<Entypo size={17} color={"red"} name="trash" />
						</Pressable>
					)}
				</View>
			</View>
			<Text className="text-slate-400 self-end text-xs">{time}</Text>
		</View>
	);
}
