import { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { Auth } from "@/store/Auth";

export default function Profile() {
	const [popupShown, setShowPopup] = useState(false);
	const [email, setEmail] = useState("");
	const [id, setID] = useState("");
	const [photo, setPhoto] = useState("");

	const { user, logout } = Auth();

	useEffect(() => {
		if (!user) return;
		setEmail(user.email!);
		setID(user.uid!);
		setPhoto(user.photoURL!);
	}, []);

	const timeout = () => {
		setTimeout(() => setShowPopup(false), 2000);
	};

	const copyEmail = async () => {
		await Clipboard.setStringAsync(email);
		setShowPopup(true);
		timeout();
	};

	const copyID = async () => {
		await Clipboard.setStringAsync(id);
		setShowPopup(true);
		timeout();
	};

	return (
		<View className="flex-1 bg-slate-900 items-center justify-center">
			{popupShown && (
				<View className="absolute top-6 bg-slate-700 p-3 rounded-md">
					<Text className="text-white">Copied to clipboard!</Text>
				</View>
			)}
			{photo && (
				<Image
					width={120}
					height={120}
					source={{ uri: photo }}
					className="rounded-full"
				/>
			)}
			<Text className="text-slate-300 text-2xl font-bold">John404</Text>
			<View className="mt-4 space-y-2">
				<View className="flex-row items-center">
					<Text className="text-slate-300 font-bold text-base">Email: </Text>
					<Text className="text-slate-400 text-base">
						jonathanpetersen2016@gmail.com
					</Text>
					<Pressable className="ml-2" onPress={copyEmail}>
						<Ionicons name="copy-outline" color={"#94a3b8"} size={20} />
					</Pressable>
				</View>
				<View className="flex-row items-center">
					<Text className="text-slate-300 font-bold text-base">ID: </Text>
					<Text className="text-slate-400 text-base">Hjk9las782a</Text>
					<Pressable className="ml-2" onPress={copyID}>
						<Ionicons name="copy-outline" color={"#94a3b8"} size={20} />
					</Pressable>
				</View>
				<Pressable className="ml-2" onPress={logout}>
					<Text>Logout</Text>
				</Pressable>
			</View>
		</View>
	);
}
