import { Image, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function Contact({ data }: { data: User }) {
	return (
		<View className="flex-row justify-between items-center bg-slate-800 border-b border-white/40 p-4">
			<View className="flex-row items-center">
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
			</View>
			<Ionicons
				name="remove-circle-outline"
				color={"#ef4444"}
				size={25}
			/>
		</View>
	);
}
