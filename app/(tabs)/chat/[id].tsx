import { Input } from "@/components/Input";
import { Message } from "@/components/Message";
import { Auth } from "@/store/Auth";
import { Ionicons } from "@expo/vector-icons";
import database from "@react-native-firebase/database";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

export default function ChatPage() {
	const { id } = useLocalSearchParams();
	const { user } = Auth();

	const [messages, setMessages] = useState<any>([]);
	const [text, setText] = useState("");

	useEffect(() => {
		if (!user) return;
		database()
			.ref(`/users/${user.uid}/chats/${id}`)
			.on("value", (snap) => {
				if (!snap.exists()) return;

				const msgs = snap.val();
				const data: Message[] = [];

				Object.keys(msgs).map((k) => data.push(msgs[k]));
				setMessages(data.toReversed());
			});
	}, []);

	const changeText = (t: string) => {
		setText(t);
	};

	const sendMsg = () => {
		const datetime = new Date().toISOString();
		const userData = {
			email: user?.email,
			name: user?.displayName,
			photo: user?.photoURL,
		};
		if (!user) return;
		database()
			.ref(`users/${user.uid}/chats/${id}`)
			.push()
			.set({ message: text, datetime, ...userData });
		database()
			.ref(`users/${id}/chats/${user.uid}`)
			.push()
			.set({ message: text, datetime, ...userData });
		setText("");
	};

	return (
		<View className="flex-1 bg-slate-900 p-2">
			<FlatList
				className="flex-1"
				data={messages}
				renderItem={({ item }) => <Message message={item} />}
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
