import { createContext, ReactNode, useContext } from "react";
import { useState, useEffect } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

GoogleSignin.configure({
    webClientId: '969067816085-b5486tom963kumvjeglefat537f9lh4m.apps.googleusercontent.com',
});

type Context = {
    onGoogleButtonPress: () => Promise<FirebaseAuthTypes.UserCredential | undefined>
    logout: () => Promise<void>
    user: any
}

const authContext = createContext<any>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    // Set an initializing state whilst Firebase connects
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState();

    // Handle user state changes
    function onAuthStateChanged(user: any) {
        setUser(user);
        if (initializing) setInitializing(false);
    }

    useEffect(() => {
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
        return subscriber; // unsubscribe on unmount
    }, []);

    if (initializing) return null;

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
        await auth().signOut()
    }

    return (
        <authContext.Provider value={{ onGoogleButtonPress, logout, user }}>
            {children}
        </authContext.Provider>
    );
}

export const Auth = useContext(authContext) as Context