import { FlatList, View } from "react-native";
import { Input } from "@/components/Input";
import { useEffect, useState } from "react";
import database from "@react-native-firebase/database";
import { Contact } from "@/components/Contact";
import { Auth } from "@/store/Auth";

export default function SerachContacts() {
	const [results, setResults] = useState<User[]>([]);
	const [query, setQuery] = useState("");
	const { user } = Auth();

	const changeQuery = (txt: string) => {
		setQuery(txt);
	};

	useEffect(() => {
		if (query.trim().length <= 0) return setResults([]);
		database()
			.ref("/users")
			.once("value", (snap) => {
				const users = snap.val();
				const res: User[] = [];
				Object.keys(users).forEach((k) => {
					if (users[k].id === user?.uid) return;
					if (
						users[k].username.includes(query) ||
						users[k].id === query ||
						users[k].email === query
					)
						res.push(users[k]);
				});
				setResults(res);
			});
	}, [query]);

	return (
		<View className="flex-1 bg-slate-900">
			<View className="p-2">
				<Input
					styles="rounded"
					value={query}
					placeholder="Search by username, id or email"
					changeText={changeQuery}
				/>
			</View>

			<FlatList
				className="flex-1"
				data={results}
				keyExtractor={(r) => r.id}
				renderItem={({ item }) => <Contact data={item} />}
			/>
		</View>
	);
}
