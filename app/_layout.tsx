import { AuthProvider } from "@/store/Auth";
import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import * as TaskManager from "expo-task-manager";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

TaskManager.defineTask(
	BACKGROUND_NOTIFICATION_TASK,
	({ data, error, executionInfo }) => {
		console.log("Received a notification in the background!");
	}
);

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

function useNotificationObserver() {
	useEffect(() => {
		let isMounted = true;

		function redirect(notification: Notifications.Notification) {
			const url = notification.request.content.data?.url;
			if (url) {
				setTimeout(() => router.push(url), 1000);
			}
		}

		Notifications.getLastNotificationResponseAsync().then((response) => {
			if (!isMounted || !response?.notification) {
				return;
			}
			redirect(response?.notification);
		});

		const subscription = Notifications.addNotificationResponseReceivedListener(
			(response) => {
				redirect(response.notification);
			}
		);

		return () => {
			isMounted = false;
			subscription.remove();
		};
	}, []);
}

export default function RootLayout() {
	const [loaded] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
	});

	useEffect(() => {
		if (loaded) async () => await SplashScreen.hideAsync();
	}, [loaded]);

	useNotificationObserver();

	return (
		<AuthProvider>
			<Stack>
				<Stack.Screen
					name="(tabs)"
					options={{ headerShown: false, statusBarColor: "black" }}
				/>
			</Stack>
		</AuthProvider>
	);
}
