import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Auth } from "@/store/Auth";
import { Text, View } from "react-native";

export default function TabLayout() {
	try {
		const { user } = Auth();

		return (
			<Tabs
				screenOptions={{
					headerShown: false,
					tabBarActiveBackgroundColor: "#1e293b",
					tabBarInactiveBackgroundColor: "#1e293b",
					tabBarActiveTintColor: "white",
				}}
			>
				<Tabs.Screen
					name="index"
					options={{
						title: "Contacts",
						tabBarIcon: ({ color }) => (
							<Ionicons name="people-outline" color={color} size={20} />
						),
						href: user ? "/(tabs)/" : null,
					}}
				/>
				<Tabs.Screen
					name="add"
					options={{
						title: "Add contact",
						tabBarIcon: ({ color }) => (
							<Ionicons name="person-add-outline" color={color} size={20} />
						),
						href: user ? "/(tabs)/add" : null,
					}}
				/>
				<Tabs.Screen
					name="profile"
					options={{
						title: "Profile",
						tabBarIcon: ({ color }) => (
							<Ionicons name="person-circle-outline" color={color} size={25} />
						),
					}}
				/>
				<Tabs.Screen
					name="chat/[id]"
					options={{
						href: null,
					}}
				/>
			</Tabs>
		);
	} catch (error) {
		return (
			<View className="flex-1 bg-slate-900 items-center justify-center">
				<Text className="text-white text-2xl">Something went wrong 😵</Text>
				<Text className="text-white text-lg">Try re-opening the app</Text>
			</View>
		);
	}
}
