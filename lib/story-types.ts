/**
 * Story Types and Subtypes Configuration
 * Defines all available story genres and their specific writing prompts
 */

export interface StorySubtype {
  id: string
  label: string
  description: string
  prompt: string // Additional prompt context for OpenAI
}

export interface StoryType {
  id: string
  label: string
  icon: string
  description: string
  subtypes: StorySubtype[]
}

export const storyTypes: StoryType[] = [
  {
    id: 'adventure',
    label: 'Adventure Stories',
    icon: '🌟',
    description: 'Kids LOVE adventure because it feels exciting and empowering.',
    subtypes: [
      {
        id: 'quest',
        label: 'Quest',
        description: 'A journey to achieve a specific goal or find something important',
        prompt: 'Write a quest adventure where the protagonist embarks on a journey to achieve an important goal. Include challenges they must overcome, allies they meet along the way, and a satisfying conclusion when they reach their objective.'
      },
      {
        id: 'treasure-hunt',
        label: 'Treasure Hunt',
        description: 'Searching for hidden treasure with clues and obstacles',
        prompt: 'Write a treasure hunt story with hidden clues, mysterious maps, and obstacles the characters must navigate. Build suspense as they get closer to discovering the treasure, and include a surprising revelation about what they find.'
      },
      {
        id: 'survival',
        label: 'Survival Story',
        description: 'Overcoming harsh conditions and staying alive',
        prompt: 'Write a survival story where characters must use their wits and skills to overcome harsh conditions. Show their resourcefulness, the dangers they face, and how they grow stronger through the challenges.'
      },
      {
        id: 'unknown-worlds',
        label: 'Exploring Unknown Worlds',
        description: 'Discovering new places and encountering the unexpected',
        prompt: 'Write a story about exploring an unknown world filled with wonder and danger. Describe the strange sights, creatures, and customs the characters encounter, and how they navigate this unfamiliar territory.'
      },
      {
        id: 'mystery-adventure',
        label: 'Mystery on the Go',
        description: 'Solving mysteries while traveling or on an adventure',
        prompt: 'Write an adventure story where characters must solve mysteries as they travel. Weave clues throughout their journey, create moments of discovery, and build to an exciting revelation that changes everything.'
      }
    ]
  },
  {
    id: 'mystery',
    label: 'Mystery & Detective Stories',
    icon: '🕵️',
    description: 'Great for curious kids who like solving puzzles.',
    subtypes: [
      {
        id: 'clues-herrings',
        label: 'Clues & Red Herrings',
        description: 'Classic mystery with misleading clues',
        prompt: 'Write a mystery story with clever clues and red herrings that keep readers guessing. Plant both real evidence and misleading details, letting the detective (and reader) piece together the truth through careful observation.'
      },
      {
        id: 'kid-detective',
        label: 'Kid Detective',
        description: 'Young sleuths solving cases',
        prompt: 'Write a story featuring a kid detective who uses logic, observation, and courage to solve a mystery. Show their unique perspective and methods, and how they outsmart adults or uncover what others missed.'
      },
      {
        id: 'neighborhood-secrets',
        label: 'Neighborhood Secrets',
        description: 'Mysteries in familiar places',
        prompt: 'Write a mystery set in a familiar neighborhood where strange things are happening. Make ordinary places feel mysterious, and reveal surprising secrets hidden in plain sight.'
      },
      {
        id: 'school-mystery',
        label: 'School Mystery',
        description: 'Puzzles and secrets at school',
        prompt: 'Write a school-based mystery where students uncover secrets within their school. Use familiar school settings (classrooms, lockers, library) in unexpected ways, and create a mystery that affects the whole school community.'
      }
    ]
  },
  {
    id: 'fantasy',
    label: 'Fantasy & Magical Worlds',
    icon: '🧙‍♂️',
    description: 'Always a top favorite for ages 8–12.',
    subtypes: [
      {
        id: 'magical-creatures',
        label: 'Magical Creatures',
        description: 'Dragons, unicorns, and fantastic beasts',
        prompt: 'Write a fantasy story featuring magical creatures with unique abilities and personalities. Describe their appearance, powers, and the bond they form with the human characters. Make the creatures feel real and important to the story.'
      },
      {
        id: 'spells-powers',
        label: 'Spells & Powers',
        description: 'Magic systems and supernatural abilities',
        prompt: 'Write a story about characters learning to use magical powers or spells. Show both the wonder and challenges of magic, include moments where spells go wrong or have unexpected effects, and demonstrate growth in magical ability.'
      },
      {
        id: 'portal-worlds',
        label: 'Portal to New Worlds',
        description: 'Gateways to magical realms',
        prompt: 'Write a story about discovering a portal to a magical world. Describe the moment of crossing over, the wonders and dangers of the new realm, and the challenge of moving between two worlds.'
      },
      {
        id: 'talking-animals',
        label: 'Talking Animals',
        description: 'Animals with human speech and personalities',
        prompt: 'Write a fantasy story where animals can talk and have complex personalities. Give each animal character distinct traits based on their species, show how they interact with humans (if at all), and explore themes through their animal perspectives.'
      }
    ]
  },
  {
    id: 'humor',
    label: 'Humor / Funny Stories',
    icon: '😂',
    description: 'Kids LOVE funny, silly, sometimes outrageous stories.',
    subtypes: [
      {
        id: 'diary-humor',
        label: 'Diary-Style Humor',
        description: 'First-person funny observations and mishaps',
        prompt: 'Write a humorous story in diary or journal format where the narrator recounts funny events with their own comedic commentary. Use exaggeration, misunderstandings, and relatable embarrassments to create laughs.'
      },
      {
        id: 'school-mischief',
        label: 'School Mischief',
        description: 'Pranks and funny situations at school',
        prompt: 'Write a funny story about school mischief and pranks that go hilariously wrong. Include outrageous situations, misunderstandings with teachers, and consequences that are funny rather than mean-spirited.'
      },
      {
        id: 'funny-problems',
        label: 'Funny Problems',
        description: 'Characters in ridiculous predicaments',
        prompt: 'Write a story where characters face absurd, exaggerated problems that spiral into increasingly funny situations. Use slapstick, wordplay, and unexpected twists to keep the humor building throughout.'
      }
    ]
  },
  {
    id: 'friendship',
    label: 'Friendship & School-Life Stories',
    icon: '❤️',
    description: 'Kids want to read about lives that feel close to their own.',
    subtypes: [
      {
        id: 'friend-drama',
        label: 'Friend Drama',
        description: 'Conflicts and resolutions between friends',
        prompt: 'Write a realistic story about friendship challenges - misunderstandings, disagreements, or hurt feelings between friends. Show both the conflict and how characters work through it, emphasizing communication and empathy.'
      },
      {
        id: 'new-kid',
        label: 'New Kid at School',
        description: 'Starting fresh and making friends',
        prompt: 'Write a story about being the new kid at school. Capture the nervousness, the attempts to fit in, the small moments of connection, and the journey to finding where you belong.'
      },
      {
        id: 'bullying-kindness',
        label: 'Bullying & Kindness',
        description: 'Standing up to meanness with courage',
        prompt: 'Write a story about bullying and kindness, showing how characters find the courage to stand up for themselves or others. Handle the topic with sensitivity while showing that kindness and bravery make a real difference.'
      },
      {
        id: 'siblings',
        label: 'Sibling Relationships',
        description: 'Brothers, sisters, and family dynamics',
        prompt: 'Write a story exploring sibling relationships - the rivalry, the love, the annoyance, and the loyalty. Show both conflict and connection, and how siblings ultimately support each other when it matters.'
      }
    ]
  },
  {
    id: 'growth',
    label: 'Heroes / Personal Growth Stories',
    icon: '🦸',
    description: 'Stories where a kid grows stronger or learns something important.',
    subtypes: [
      {
        id: 'overcoming-fear',
        label: 'Overcoming Fear',
        description: 'Finding courage to face what scares you',
        prompt: 'Write an inspirational story about a character overcoming a specific fear. Show their initial struggle, the moment they decide to be brave, and how facing their fear changes them for the better.'
      },
      {
        id: 'standing-up',
        label: 'Standing Up to Bullies',
        description: 'Finding the strength to fight back against injustice',
        prompt: 'Write a story about finding the courage to stand up to a bully. Show the character\'s journey from feeling powerless to finding their voice, and emphasize that standing up doesn\'t always mean fighting - it means refusing to accept wrong.'
      },
      {
        id: 'learning-skill',
        label: 'Learning a New Skill',
        description: 'Persistence through practice and failure',
        prompt: 'Write a story about learning a challenging new skill through determination and practice. Show the failures, the frustration, the small improvements, and the satisfying moment of success through perseverance.'
      },
      {
        id: 'finding-confidence',
        label: 'Finding Confidence',
        description: 'Discovering inner strength and self-belief',
        prompt: 'Write a story about a character discovering their own worth and confidence. Show how they move from self-doubt to self-belief through experiences that reveal their strengths, without being preachy or overly moralistic.'
      }
    ]
  },
  {
    id: 'scifi',
    label: 'Sci-Fi / Futuristic Stories',
    icon: '👽',
    description: 'Especially popular with curious or tech-minded kids.',
    subtypes: [
      {
        id: 'robots',
        label: 'Robots',
        description: 'AI, androids, and robotic companions',
        prompt: 'Write a sci-fi story featuring robots or AI with personality and purpose. Explore what makes them different from humans, their relationship with people, and questions about consciousness and emotion.'
      },
      {
        id: 'time-travel',
        label: 'Time Travel',
        description: 'Journeying through past and future',
        prompt: 'Write a time travel story with clear rules about how time works. Show the wonder of different time periods, the challenges of changing history, and the consequences (or paradoxes) of time travel.'
      },
      {
        id: 'space-missions',
        label: 'Space Missions',
        description: 'Adventures among the stars',
        prompt: 'Write a space adventure on a mission beyond Earth. Describe zero gravity, alien worlds, the vastness of space, the challenges of space travel, and the teamwork needed to survive in the cosmos.'
      },
      {
        id: 'virtual-reality',
        label: 'Virtual Reality Worlds',
        description: 'Digital realms and simulated experiences',
        prompt: 'Write a story set in or involving virtual reality worlds. Explore the blurred line between real and virtual, the excitement of digital possibilities, and the question of what happens when you can\'t tell the difference.'
      }
    ]
  },
  {
    id: 'animals',
    label: 'Animal Stories',
    icon: '🐻',
    description: 'Consistently loved across generations.',
    subtypes: [
      {
        id: 'talking-animals-realistic',
        label: 'Talking Animals',
        description: 'Animals with voices and personalities',
        prompt: 'Write a story with talking animals who have distinct personalities and their own society. Blend animal behaviors with human-like emotions and decisions, creating characters that feel both real and fantastical.'
      },
      {
        id: 'pet-adventures',
        label: 'Pet Adventures',
        description: 'Beloved pets on exciting journeys',
        prompt: 'Write an adventure story from the perspective of a pet or featuring a pet as a main character. Show the special bond between pet and owner, and take the pet on an exciting journey that reveals their loyalty and courage.'
      },
      {
        id: 'wild-survival',
        label: 'Wild Animal Survival',
        description: 'Animals in nature facing challenges',
        prompt: 'Write a realistic survival story from a wild animal\'s perspective. Show their natural instincts, the dangers they face, their interactions with their ecosystem, and the harsh realities of survival in nature.'
      }
    ]
  },
  {
    id: 'stem',
    label: 'Problem-Solving / STEM Stories',
    icon: '🧩',
    description: 'For kids who love logic or science.',
    subtypes: [
      {
        id: 'inventions',
        label: 'Building Inventions',
        description: 'Creating gadgets and solving problems',
        prompt: 'Write a story about characters inventing something to solve a problem. Show the design process, the failed prototypes, the breakthrough moments, and the satisfaction of making something that actually works.'
      },
      {
        id: 'science-fair',
        label: 'Science Fair Chaos',
        description: 'Experiments, competitions, and discoveries',
        prompt: 'Write a story centered around a science fair project. Include the excitement of discovery, experiments that go wrong in funny ways, friendly competition, and the learning that happens through the scientific process.'
      },
      {
        id: 'math-puzzles',
        label: 'Math Puzzles in Story',
        description: 'Logic and numbers save the day',
        prompt: 'Write a story where solving math puzzles or using mathematical thinking is essential to the plot. Make the math feel exciting and heroic, not like homework, and show how logical thinking can solve real problems.'
      },
      {
        id: 'engineering',
        label: 'Engineering Challenges',
        description: 'Building, designing, and problem-solving',
        prompt: 'Write a story about engineering challenges - building something complex, fixing what\'s broken, or designing a solution. Show the iterative process, teamwork, creative problem-solving, and the joy of making things work.'
      }
    ]
  }
]

export function getStoryTypeById(id: string): StoryType | undefined {
  return storyTypes.find(type => type.id === id)
}

export function getStorySubtypeById(typeId: string, subtypeId: string): StorySubtype | undefined {
  const type = getStoryTypeById(typeId)
  return type?.subtypes.find(subtype => subtype.id === subtypeId)
}
