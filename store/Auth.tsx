import { createContext, ReactNode, useContext } from "react";
import { useState, useEffect } from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import database from "@react-native-firebase/database";
import { User as FirebaseUser } from "firebase/auth";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

GoogleSignin.configure({
	webClientId:
		"969067816085-b5486tom963kumvjeglefat537f9lh4m.apps.googleusercontent.com",
});

interface JChatUser extends FirebaseUser {
	expoPushToken: string;
}

type Context = {
	onGoogleButtonPress: () => Promise<
		FirebaseAuthTypes.UserCredential | undefined
	>;
	logout: () => Promise<void>;
	user: JChatUser | null;
};

const authContext = createContext<any>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<FirebaseUser | null>();

	async function writeUserOnDb(user: FirebaseUser) {
		database().ref(`users/${user.uid}`).set({
			email: user.email,
			id: user.uid,
			profile_picture: user.photoURL,
			username: user.displayName,
			online: true,
		});
	}

	// Handle user state changes
	async function onAuthStateChanged(user: any) {
		const pushTokenString = (
			await Notifications.getExpoPushTokenAsync({
				projectId: Constants.expoConfig!.extra!.eas.projectId,
			})
		).data;
		database().ref(`users/${user.uid}`).update({
			expo_push_token: pushTokenString,
			online: true,
		});
		if (user) {
			setUser(user);
		} else {
			setUser(null);
		}
	}

	useEffect(() => {
		if (!user) return;
		database()
			.ref(`users/${user.uid}`)
			.onDisconnect()
			.update({ online: false });
		database()
			.ref(`/users/${user.uid}`)
			.once("value", (snap) => {
				if (!snap.exists()) writeUserOnDb(user);
			});
	}, [user]);

	useEffect(() => {
		const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
		return subscriber; // unsubscribe on unmount
	}, []);

	async function onGoogleButtonPress() {
		// Check if your device supports Google Play
		await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
		// Get the users ID token
		const { data } = await GoogleSignin.signIn();
		if (data) {
			// Create a Google credential with the token
			const googleCredential = auth.GoogleAuthProvider.credential(data.idToken);

			// Sign-in the user with the credential
			return auth().signInWithCredential(googleCredential);
		}
	}

	async function logout() {
		await auth().signOut();
	}

	if (!user) {
		return (
			<View className="flex-1 bg-slate-900 items-center justify-center">
				<Text className="text-2xl font-bold text-white">
					Login to use the app
				</Text>
				<Pressable
					className="mt-6 flex-row items-center border border-white px-6 py-2 rounded-md"
					onPress={onGoogleButtonPress}
				>
					<Text className="text-white text-base">Sign in with Google</Text>
					<Ionicons color={"white"} size={20} name="logo-google" />
				</Pressable>
			</View>
		);
	}

	return (
		<authContext.Provider value={{ onGoogleButtonPress, logout, user }}>
			{children}
		</authContext.Provider>
	);
}

export const Auth = () => useContext(authContext) as Context;
