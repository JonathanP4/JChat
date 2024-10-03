import { Ionicons } from "@expo/vector-icons";
import { Pressable, TextInput, View } from "react-native";

export function SearchBar() {
	return (
		<View className="flex-row items-center p-3">
			<TextInput className="text-slate-300 py-1 px-2 border border-slate-600 bg-slate-800 rounded-l flex-1" />
			<Pressable className="bg-slate-600 p-2 rounded-r">
				<Ionicons name="search" color={"white"} size={20} />
			</Pressable>
		</View>
	);
}
