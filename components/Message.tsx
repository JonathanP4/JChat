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
		<View>
			{message.replyTo && (
				<View className="bg-slate-500 py-1 px-2 rounded-md flex-row">
					<FontAwesome5 size={17} name="replyd" color={"white"} />
					<Text numberOfLines={1} className="text-white/70 ml-1">
						{message.replyTo.message}
					</Text>
				</View>
			)}
			<View className="p-2 flex-row space-x-2 border-b border-slate-700 mb-2">
				<Image
					className="rounded-full"
					width={40}
					height={40}
					source={{ uri: message.photo }}
				/>
				<View className="flex-1">
					<View className="flex-row justify-between flex-1 min-h-[20px]">
						<Text className="text-white font-bold text-base">
							{message.name}
						</Text>
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

					<Text className="text-white" selectable>
						{message.message.match(linkRegex) &&
							message.message.split(" ").map((txt, idx) =>
								linkRegex.test(txt) ? (
									<Link
										key={txt + idx}
										selectable
										className="text-blue-500"
										href={txt as Href}
									>
										{txt}{" "}
									</Link>
								) : (
									<Text key={txt + idx} selectable>
										{txt}{" "}
									</Text>
								)
							)}
						{!message.message.match(linkRegex) && message.message}
					</Text>
					<Text className="text-slate-400 text-xs text-right">{time}</Text>
				</View>
			</View>
		</View>
	);
}
