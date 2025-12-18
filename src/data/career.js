export const careerNodes = [
    {
        id: "node1",
        type: "event", // Event node (Red)
        title: "Event BeginPlay (2018)",
        subtitle: "University Degree",
        description: "Graduated with a BS in Computer Science. Specialized in Graphics Programming and AI.",
        details: "Focus on C++ and OpenGL. \nGPA: 4.0\nAwarded Best Capstone Project.",
        year: 2018,
        x: 100,
        y: 150,
        next: "node2"
    },
    {
        id: "node2",
        type: "function", // Function node (Blue)
        title: "Joined Game Studio A",
        subtitle: "Junior Developer",
        description: "Worked on UI systems and gameplay mechanics for an RPG title.",
        details: "Responsible for inventory system and quest log.\nTech: UE4, C++.",
        year: 2019,
        x: 500,
        y: 150,
        next: "node3"
    },
    {
        id: "node3",
        type: "function", // Function node (Blue)
        title: "Promoted to Senior",
        subtitle: "Senior Gameplay Engineer",
        description: "Led the combat team for 'Project X'.",
        details: "Designed the ability system architecture.\nMentored 3 junior devs.",
        year: 2021,
        x: 900,
        y: 150,
        next: "node4"
    },
    {
        id: "node4",
        type: "function",
        title: "Joined FTS GLOBAL",
        subtitle: "Lead Technical Designer",
        description: "Focusing on advanced simulation and anticheat systems.",
        details: "Company Link: https://fts-global.com\nSpecialized in Ballistics and System Security.",
        year: 2023,
        x: 1300,
        y: 150,
        next: null
    }
];
