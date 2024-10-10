import { Auth } from "@/store/Auth";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import database from "@react-native-firebase/database";

type Props = {
	message: Message;
	contactID: string | string[];
};

export function Message({ message, contactID }: Props) {
	const { user } = Auth();
	const time = new Date(message.datetime).toLocaleTimeString("en-us", {
		timeStyle: "short",
	});
	const [isFromCurrentUser, setIsFromCurrentUser] = useState(false);

	useEffect(() => {
		setIsFromCurrentUser(message.userID === user?.uid);
	}, []);

	const deleteMessage = () => {
		database()
			.ref(`/users/${user?.uid}/chats/${contactID}/${message.id}`)
			.set(null);
		database()
			.ref(`/users/${contactID}/chats/${user?.uid}/${message.id}`)
			.set(null);
	};

	return (
		<View className="p-2 flex-row space-x-2 border-b border-slate-700 mb-2 min-h-[70px]">
			<Image
				className="rounded-full"
				width={40}
				height={40}
				source={{ uri: message.photo }}
			/>
			<View className="flex-1">
				<View className="flex-row justify-between flex-1">
					<Text className="text-white font-bold">{message.name}</Text>
					{isFromCurrentUser && (
						<Pressable className="px-2" onPress={deleteMessage}>
							<Ionicons size={17} color={"red"} name="trash" />
						</Pressable>
					)}
				</View>
				<View className="space-x-1">
					<Text className="text-white">{message.message}</Text>
					<Text className="text-slate-400 text-xs text-right">{time}</Text>
				</View>
			</View>
		</View>
	);
}
