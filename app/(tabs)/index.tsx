import { Contact } from "@/components/Contact";
import { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import database from '@react-native-firebase/database'

export default function HomeScreen() {
	const [users, setUsers] = useState<User[]>([])

	useEffect(() => {
		database()
			.ref('/users')
			.on('value', (snapshot) => {
				if (snapshot.exists()) {
					const usersData = snapshot.val()
					const data: User[] = []

					Object.keys(usersData).forEach(k => data.push(usersData[k]))

					setUsers(data)
				}
			})
	}, [])

	return (
		<View className="flex-1 bg-slate-900">
			<FlatList data={users} renderItem={({ item }) => <Contact data={item} />} />
		</View>
	);
}