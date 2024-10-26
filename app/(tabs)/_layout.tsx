import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Auth } from "@/store/Auth";

export default function TabLayout() {
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
					unmountOnBlur: true,
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
					headerShown: true,
					headerStyle: { backgroundColor: "#334155" },
					headerTitleStyle: { color: "white" },
					unmountOnBlur: true,
					href: null,
				}}
			/>
		</Tabs>
	);
}
