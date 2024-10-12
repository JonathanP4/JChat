type User = {
	email: string;
	id: string;
	profile_picture: string;
	username: string;
	expo_push_token: string;
};

type Message = {
	datetime: string;
	message?: string;
	media?: Media;
	userID: string;
	id: string;
	name: string;
	photo: string;
	replyTo?: { user: string; message: string };
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

type Media = { width: string; height: string; url: string };
