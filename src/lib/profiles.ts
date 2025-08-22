export interface Profile {
  id: string;
  name: string;
  class: string;
  avatar: string;
  description: string;
}

export const profiles: Profile[] = [
  {
    id: 'deepak',
    name: 'Deepak',
    class: '9th Class',
    avatar: '/avatars/deepak.png',
    description: 'IIT Foundation track, focus: Mathematics first, then Science. Slow learner.'
  },
  // Add other profiles here in the future
];
