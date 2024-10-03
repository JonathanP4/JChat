import { Text, View } from "react-native";
import { SearchBar } from "@/components/SearchBar";

export default function SerachContacts() {
	return (
		<View className="flex-1 bg-slate-900">
			<SearchBar />
		</View>
	);
}
