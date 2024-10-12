import { Auth } from "@/store/Auth";
import { Entypo, FontAwesome5 } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import database from "@react-native-firebase/database";
import { Href, Link } from "expo-router";

type Props = {
	message: Message;
	contactID: string | string[];
	reply: (msg: Message) => void;
};

export function Message({ message, contactID, reply }: Props) {
	const { user } = Auth();

	const linkRegex = new RegExp(/http(s)?:\/\/.*/gi);
	const time = new Date(message.datetime).toLocaleTimeString("en-us", {
		timeStyle: "short",
	});

	const [isFromCurrentUser, setIsFromCurrentUser] = useState(false);

	useEffect(() => {
		setIsFromCurrentUser(message.userID === user?.uid);
	}, []);

	const deleteMessage = () => {
		if (!user) return;
		database()
			.ref(`/users/${user.uid}/chats/${contactID}/${message.id}`)
			.set(null);
	};

	return (
		<View className="pl-2 border border-t-slate-700">
			{message.replyTo && (
				<View className="bg-slate-500 py-1 px-2 flex-row">
					<FontAwesome5 size={17} name="replyd" color={"white"} />
					<Text numberOfLines={1} className="text-white/70 ml-1">
						{message.replyTo.message}
					</Text>
				</View>
			)}
			<View className="px-2 py-4 flex-row justify-between items-start">
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
						{message.message && (
							<Text className="text-white">{message.message}</Text>
						)}
						{message.media && (
							<View className="p-2 bg-slate-500 rounded-md mt-2">
								<Image
									width={200}
									height={200}
									source={{ uri: message.media.url }}
								/>
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
		</View>
	);
}
