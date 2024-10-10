import { Image, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import database from "@react-native-firebase/database";
import { Auth } from "@/store/Auth";
import { router } from "expo-router";

export function Contact({ data }: { data: User }) {
	const [isContact, setIsContact] = useState(false);
	const { user } = Auth();

	useEffect(() => {
		if (!user) return;
		database()
			.ref(`users/${user.uid}/contacts`)
			.on("value", (snap) => {
				if (snap.exists()) {
					const contacts = snap.val();

					Object.keys(snap.val()).forEach((k) => {
						if (contacts[k].id === data.id) {
							setIsContact(true);
						}
					});
				}
			});
	}, []);

	const addOrRemoveContact = () => {
		setIsContact((s) => !s);

		if (!user) return;
		database()
			.ref(`users/${user.uid}/contacts/${data.id}`)
			.set(isContact ? null : data);
	};

	const goToChat = () => {
		router.replace(`/(tabs)/chat/${data.id}`);
	};

	return (
		<View className="flex-row justify-between items-center bg-slate-800 border-b border-white/40 p-4">
			<Pressable onPress={goToChat} className="flex-row items-center flex-1">
				<Image
					className="rounded-full"
					width={60}
					height={60}
					source={{ uri: data.profile_picture }}
				/>
				<View className="ml-3">
					<Text className="text-lg text-white font-bold">{data.username}</Text>
					<Text className="text-white/60">Hello I'm using JChat</Text>
				</View>
			</Pressable>
			<Pressable onPress={addOrRemoveContact}>
				<Ionicons
					name={`${isContact ? "remove-circle-outline" : "add-circle-outline"}`}
					color={`${isContact ? "#ef4444" : "#ffffff"}`}
					size={25}
				/>
			</Pressable>
		</View>
	);
}
