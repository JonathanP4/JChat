import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
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
						<Ionicons
							name="people-outline"
							color={color}
							size={20}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="add"
				options={{
					title: "Add contact",
					tabBarIcon: ({ color }) => (
						<Ionicons
							name="person-add-outline"
							color={color}
							size={20}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					tabBarIcon: ({ color }) => (
						<Ionicons
							name="person-circle-outline"
							color={color}
							size={25}
						/>
					),
				}}
			/>
		</Tabs>
	);
}
