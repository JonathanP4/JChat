import { Image, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import database from "@react-native-firebase/database"
import { useEffect } from "react";

export function Contact() {
	const reference = database().ref('/users/');
	// useEffect(() => {
	// 	database()
	// 		.ref('/users')
	// 		.on('value', (snapshot) => {
	// 			console.log('User data: ', snapshot.val());
	// 		})
	// }, [])
	return (
		<View className="flex-row justify-between items-center bg-slate-800 border-b border-white/40 p-4">
			<View className="flex-row items-center">
				<Image
					className="rounded-full"
					width={60}
					height={60}
					source={{ uri: "https://picsum.photos/60/60" }}
				/>
				<View className="ml-3">
					<Text className="text-lg text-white font-bold">Alex</Text>
					<Text className="text-white/60">Hello I'm using JChat</Text>
				</View>
			</View>
			<Ionicons
				name="remove-circle-outline"
				color={"#ef4444"}
				size={25}
			/>
		</View>
	);
}
