import { Contact } from "@/components/Contact";
import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import database from "@react-native-firebase/database";
import { Auth } from "@/store/Auth";
import { SplashScreen } from "expo-router";

export default function HomeScreen() {
	const [users, setUsers] = useState<User[]>([]);
	const [loaded, setLoaded] = useState(false);
	const { user } = Auth();

	useEffect(() => {
		if (!user) return;
		database()
			.ref(`/users/${user.uid}/contacts`)
			.on("value", (snapshot) => {
				if (snapshot.exists()) {
					const usersData = snapshot.val();
					const data: User[] = [];

					Object.keys(usersData).forEach((k) => {
						data.push(usersData[k]);
					});

					setUsers(data);
				} else {
					setUsers([]);
				}
				setLoaded(true);
			});
	}, []);

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	return (
		<View className="flex-1 bg-slate-900">
			{!!users.length ? (
				<FlatList
					data={users}
					keyExtractor={(i) => i.id}
					renderItem={({ item }) => <Contact data={item} />}
				/>
			) : (
				<Text className="text-slate-400 p-4 text-lg">
					You have no contacts yet.
				</Text>
			)}
		</View>
	);
}
