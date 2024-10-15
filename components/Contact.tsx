import { Image, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import database from "@react-native-firebase/database";
import { Auth } from "@/store/Auth";
import { router } from "expo-router";

export function Contact({ data }: { data: User }) {
	const [contact, setContact] = useState<User | null>(null);
	const [online, setOnline] = useState(false);
	const { user } = Auth();

	useEffect(() => {
		if (!user) return;

		database()
			.ref(`users/${user.uid}/contacts/${data.id}`)
			.on("value", (snap) => {
				setContact(snap.val());
			});
		database()
			.ref(`users/${data.id}/online`)
			.on("value", (snap) => {
				if (snap.exists()) {
					setOnline(snap.val());
				}
			});
	}, []);

	const addOrRemoveContact = () => {
		if (!user) return;
		const contactData = {
			id: data.id,
			profile_picture: data.profile_picture,
			username: data.username,
			online: data.online,
		};
		database()
			.ref(`users/${user.uid}/contacts/${data.id}`)
			.set(contact ? null : contactData);
	};

	const goToChat = () => {
		router.replace(`/(tabs)/chat/${data.id}`);
	};

	return (
		<View className="flex-row justify-between items-center bg-slate-800 border-b border-white/40 p-4">
			<Pressable onPress={goToChat} className="flex-row items-center flex-1">
				<View>
					<View
						className={`${
							online ? "bg-green-500" : "bg-red-500"
						} rounded-full w-4 h-4 absolute right-0 z-20 border border-white`}
					/>
					<Image
						className="rounded-full"
						width={60}
						height={60}
						source={{ uri: data.profile_picture }}
					/>
				</View>
				<View className="ml-3">
					<Text className="text-lg text-white font-bold">{data.username}</Text>
					<Text className="text-white/60">Hello I'm using JChat</Text>
				</View>
			</Pressable>
			<Pressable onPress={addOrRemoveContact}>
				<Ionicons
					name={`${contact ? "remove-circle-outline" : "add-circle-outline"}`}
					color={`${contact ? "#ef4444" : "#ffffff"}`}
					size={25}
				/>
			</Pressable>
		</View>
	);
}
