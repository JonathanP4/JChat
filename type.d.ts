type User = {
	email: string;
	id: string;
	profile_picture: string;
	username: string;
	expo_push_token: string;
};

type Message = {
	datetime: string;
	message: string;
	userID: string;
	id: string;
	name: string;
	photo: string;
};

interface FirebaseData {
	title?: string;
	message?: string;
	subtitle?: string;
	sound?: boolean | string;
	vibrate?: boolean | number[];
	priority?: AndroidNotificationPriority;
	badge?: number;
}
