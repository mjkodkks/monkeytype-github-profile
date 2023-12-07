export interface MonkeyTypeResponse {
    message: string;
    data: Data;
}

export interface Data {
    name: string;
    addedAt: number;
    typingStats: TypingStats;
    personalBests: PersonalBests;
    xp: number;
    streak: number;
    maxStreak: number;
    details: Details;
    allTimeLbs: AllTimeLbs;
    uid: string;
}

export interface AllTimeLbs {
    time: unknown;
}

export interface Details {
    bio: string;
    keyboard: string;
    socialProfiles: SocialProfiles;
}

export interface SocialProfiles {
    github: string;
    twitter: string;
    website: string;
}

export interface PersonalBests {
    time: Time;
    words: Words;
}

export interface Words {
    [x: string]: Detail[];
}

export interface Time {
    [x: string]: Detail[];
}

export interface Detail {
    acc: number;
    consistency: number;
    difficulty: string;
    lazyMode: boolean;
    language: string;
    punctuation: boolean;
    raw: number;
    wpm: number;
    timestamp: number;
}

export interface TypingStats {
    completedTests: number;
    startedTests: number;
    timeTyping: number;
}
