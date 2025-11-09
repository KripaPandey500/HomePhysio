const defaultExercises = [
  {
    _id: "1",
    name: "Neck Stretch",
    description: "Sit or stand up straight with your shoulders relaxed.\nSlowly tilt your head to the right, bringing your ear toward your shoulder, without raising your shoulder.\nHold this position for 15 seconds.\nSlowly return your head to the center.\nTilt to the left side and hold for another 15 seconds.\nRepeat this movement for three sets, moving gently.",
    bodyPart: "neck",
    image: "assets/images/neck stretch.png",
    sets: 3,
    reps: 10,
    difficulty: "Easy"
  },
  {
    _id: "2",
    name: "Shoulder Stretch",
    description: "Stand straight with your feet shoulder-width apart.\nBring your right arm across your chest.\nUse your left hand to gently press the arm closer to your chest.\nHold for 20 seconds.\nRelease slowly and repeat with the left arm.\nPerform three sets for each arm, moving slowly.",
    bodyPart: "shoulder",
    image: "assets/images/shoulder stretch.png",
    sets: 3,
    reps: 12,
    difficulty: "Easy"
  },
  {
    _id: "3",
    name: "Back Extension",
    description: "Lie face down on a mat with legs extended.\nPlace your hands behind your head.\nSlowly lift your chest off the floor, keeping your neck neutral.\nHold briefly at the top.\nLower back down slowly.\nRepeat for three sets of 15 repetitions.",
    bodyPart: "back",
    image: "assets/images/back extension.png",
    sets: 3,
    reps: 15,
    difficulty: "Medium"
  },
  {
    _id: "4",
    name: "Hand Grip",
    description: "Hold a stress ball or grip trainer in one hand.\nSqueeze tightly and hold for 2-3 seconds.\nRelease slowly and let your hand relax.\nRepeat 20 times for each hand.\nComplete two sets, moving smoothly without jerking.",
    bodyPart: "hands",
    image: "assets/images/hand grip.png",
    sets: 2,
    reps: 20,
    difficulty: "Easy"
  },
  {
    _id: "5",
    name: "Knee Flexion",
    description: "Sit on a sturdy chair with feet flat.\nLift one leg and bend your knee.\nHold for 2 seconds.\nLower your leg slowly.\nRepeat 15 times per leg.\nPerform three sets, moving gently.",
    bodyPart: "knee",
    image: "assets/images/knee flexion.png",
    sets: 3,
    reps: 15,
    difficulty: "Medium"
  },
  {
    _id: "6",
    name: "Leg Raise",
    description: "Lie on your back with legs straight.\nLift one leg slowly to 45 degrees.\nLower it back without touching the floor.\nRepeat 12 times per leg.\nDo three sets, moving slowly and controlled.",
    bodyPart: "leg",
    image: "assets/images/leg raise.png",
    sets: 3,
    reps: 12,
    difficulty: "Medium"
  },
  {
    _id: "7",
    name: "Ankle Rotation",
    description: "Sit or lie down with legs extended.\nRotate your right ankle clockwise 15 times.\nRotate counterclockwise 15 times.\nSwitch ankle and repeat.\nDo two sets for each ankle, moving smoothly.",
    bodyPart: "ankle",
    image: "assets/images/ankle rotation.png",
    sets: 2,
    reps: 15,
    difficulty: "Easy"
  },
  {
    _id: "8",
    name: "Neck Tilt",
    description: "Sit straight with shoulders relaxed.\nTilt your head slowly toward the right shoulder.\nHold for 10 seconds.\nReturn to center.\nTilt to the left shoulder and hold.\nRepeat three sets, moving gently.",
    bodyPart: "neck",
    image: "assets/images/neck tilt.png",
    sets: 3,
    reps: 10,
    difficulty: "Easy"
  },
  {
    _id: "9",
    name: "Shoulder Press",
    description: "Stand or sit with dumbbells at shoulder height.\nPress upward until arms are straight.\nLower slowly back to shoulder level.\nRepeat 12 times.\nDo three sets, moving in a controlled manner.",
    bodyPart: "shoulder",
    image: "assets/images/shoulder press.png",
    sets: 3,
    reps: 12,
    difficulty: "Medium"
  },
  {
    _id: "10",
    name: "Back Twist",
    description: "Sit on the floor with legs extended.\nBend your right knee and place your foot outside the left thigh.\nTwist your torso to the right and hold for 10 seconds.\nReturn to center.\nSwitch sides and repeat.\nDo two sets, moving gently.",
    bodyPart: "back",
    image: "assets/images/back twist.png",
    sets: 2,
    reps: 10,
    difficulty: "Easy"
  },
  {
    _id: "11",
    name: "Wrist Circles",
    description: "Extend arms in front of you.\nRotate wrists clockwise 10 times.\nRotate counterclockwise 10 times.\nRepeat for two sets, moving slowly.",
    bodyPart: "hands",
    image: "assets/images/wrist circle.png",
    sets: 2,
    reps: 20,
    difficulty: "Easy"
  },
  {
    _id: "12",
    name: "Squat",
    description: "Stand with feet shoulder-width apart.\nLower your body as if sitting on a chair.\nKeep back straight and knees behind toes.\nReturn to standing.\nRepeat 15 times for three sets, moving carefully.",
    bodyPart: "knee",
    image: "assets/images/squat.png",
    sets: 3,
    reps: 15,
    difficulty: "Medium"
  },
  {
    _id: "13",
    name: "Calf Raise",
    description: "Stand straight with feet shoulder-width apart.\nRaise heels off the ground and hold for 2 seconds.\nLower heels slowly.\nRepeat 20 times.\nDo three sets, moving controlled.",
    bodyPart: "leg",
    image: "assets/images/calf raise.png",
    sets: 3,
    reps: 20,
    difficulty: "Medium"
  },
  {
    _id: "14",
    name: "Ankle Flexion",
    description: "Sit with legs extended.\nPoint toes away from the body, then pull back toward yourself.\nRepeat 15 times per ankle.\nDo three sets, moving slowly and carefully.",
    bodyPart: "ankle",
    image: "assets/images/ankle flexion.png",
    sets: 3,
    reps: 15,
    difficulty: "Easy"
  },
  {
    _id: "15",
    name: "Arm Circles",
    description: "Extend your arms out to the sides at shoulder height.\nMake small circles forward 10 times.\nThen make small circles backward 10 times.\nDo three sets, moving slowly and controlled.",
    bodyPart: "arms",
    image: "assets/images/arm circles.png",
    sets: 3,
    reps: 20,
    difficulty: "Easy"
  },
  {
    _id: "16",
    name: "Hip Bridge",
    description: "Lie on your back with knees bent and feet flat.\nLift your hips upward until shoulders, hips, and knees form a line.\nHold for 5 seconds.\nLower slowly back down.\nRepeat 15 times, performing three sets.",
    bodyPart: "hip",
    image: "assets/images/hip bridge.png",
    sets: 3,
    reps: 15,
    difficulty: "Medium"
  },
  {
    _id: "17",
    name: "Chest Stretch",
    description: "Stand tall with feet shoulder-width apart.\nClasp hands behind your back.\nGently lift your arms to stretch your chest forward.\nHold for 20 seconds.\nRepeat three times, moving slowly.",
    bodyPart: "chest",
    image: "assets/images/chest stretch.png",
    sets: 3,
    reps: 3,
    difficulty: "Easy"
  },
  {
    _id: "18",
    name: "Wall Push-Up",
    description: "Stand an arm's length from a wall.\nPlace palms on the wall at shoulder height.\nBend elbows to bring your chest toward the wall.\nPush back to starting position.\nRepeat 10–15 times.\nDo three sets, moving slowly and controlled.",
    bodyPart: "arms",
    image: "assets/images/wall pushup.png",
    sets: 3,
    reps: 15,
    difficulty: "Easy"
  },
  {
    _id: "19",
    name: "Side Leg Raise",
    description: "Lie on your side with legs straight.\nLift the top leg slowly, hold for 2 seconds.\nLower it back down slowly.\nRepeat 12 times per leg.\nDo three sets, moving carefully.",
    bodyPart: "hip",
    image: "assets/images/side leg raise.png",
    sets: 3,
    reps: 12,
    difficulty: "Medium"
  },
  {
    _id: "20",
    name: "Torso Side Bend",
    description: "Stand with feet apart.\nPlace one hand on your hip and raise the other overhead.\nSlowly bend to the opposite side.\nHold for 10 seconds.\nReturn to starting position.\nRepeat for two sets, moving gently.",
    bodyPart: "back",
    image: "assets/images/torso side bend.png",
    sets: 2,
    reps: 10,
    difficulty: "Easy"
  },
  {
    _id: "21",
    name: "Plank Hold",
    description: "Lie face down and lift your body onto forearms and toes.\nKeep your body straight from head to heels.\nHold for 20–60 seconds depending on strength.\nLower slowly.\nRepeat for three sets, maintaining proper form.",
    bodyPart: "core",
    image: "assets/images/plank.png",
    sets: 3,
    reps: 1,
    difficulty: "Hard"
  },
  {
    _id: "22",
    name: "Lunges",
    description: "Stand straight with feet together.\nStep forward with your right leg and lower your body until both knees are at 90 degrees.\nPush back to starting position.\nRepeat 12 times per leg.\nPerform three sets, moving controlled.",
    bodyPart: "leg",
    image: "assets/images/lunges.png",
    sets: 3,
    reps: 12,
    difficulty: "Medium"
  },
  {
    _id: "23",
    name: "Side Plank",
    description: "Lie on one side with legs extended.\nLift your body on your forearm and feet, forming a straight line.\nHold for 20–40 seconds.\nSwitch sides and repeat.\nDo two to three sets, maintaining balance and control.",
    bodyPart: "core",
    image: "assets/images/side plank.png",
    sets: 3,
    reps: 1,
    difficulty: "Hard"
  },
  {
    _id: "24",
    name: "Bird Dog",
    description: "Start on hands and knees.\nExtend your right arm forward and left leg backward.\nHold for 5 seconds.\nReturn to starting position.\nRepeat on the opposite side.\nDo 10 repetitions per side, performing three sets.",
    bodyPart: "back",
    image: "assets/images/bird dog.png",
    sets: 3,
    reps: 10,
    difficulty: "Medium"
  },
  {
    _id: "25",
    name: "Seated Leg Extension",
    description: "Sit on a chair with feet flat on the floor.\nSlowly extend one leg until it is straight.\nHold for 2 seconds.\nLower back slowly.\nRepeat 12 times per leg.\nDo three sets, moving controlled.",
    bodyPart: "knee",
    image: "assets/images/seated leg extension.png",
    sets: 3,
    reps: 12,
    difficulty: "Medium"
  },
  {
    _id: "26",
    name: "Hip Circles",
    description: "Stand with hands on hips.\nRotate hips clockwise 10 times.\nThen rotate counterclockwise 10 times.\nRepeat for three sets, moving smoothly.",
    bodyPart: "hip",
    image: "assets/images/hip circles.png",
    sets: 3,
    reps: 20,
    difficulty: "Easy"
  },
  {
    _id: "27",
    name: "Toe Taps",
    description: "Lie on your back and lift legs to 90 degrees.\nLower one foot to tap the floor.\nLift it back up.\nAlternate legs 12 times each.\nDo three sets, moving slowly.",
    bodyPart: "core",
    image: "assets/images/toe taps.png",
    sets: 3,
    reps: 12,
    difficulty: "Medium"
  },
  {
    _id: "28",
    name: "Standing Calf Stretch",
    description: "Stand facing a wall.\nPlace one leg back with heel down.\nLean forward to stretch your calf.\nHold for 20 seconds.\nSwitch legs and repeat.\nDo two to three sets, moving gently.",
    bodyPart: "leg",
    image: "assets/images/standing calf stretch.png",
    sets: 3,
    reps: 1,
    difficulty: "Easy"
  },
  {
    _id: "29",
    name: "Glute Kickback",
    description: "Start on hands and knees.\nLift one leg upward keeping the knee bent.\nLower it slowly.\nRepeat 12 times per leg.\nDo three sets, moving carefully.",
    bodyPart: "hip",
    image: "assets/images/glute kickback.png",
    sets: 3,
    reps: 12,
    difficulty: "Medium"
  },
  {
    _id: "30",
    name: "Chest Press with Bands",
    description: "Hold resistance band handles at chest level.\nPress forward until arms are straight.\nSlowly return to starting position.\nRepeat 12 times.\nDo three sets, moving controlled.",
    bodyPart: "chest",
    image: "assets/images/chest press band.png",
    sets: 3,
    reps: 12,
    difficulty: "Medium"
  },
  {
    _id: "31",
    name: "Superman Exercise",
    description: "Lie face down with arms extended forward.\nLift arms and legs off the floor.\nHold for 5 seconds.\nLower slowly back down.\nRepeat 10 times, performing three sets.",
    bodyPart: "back",
    image: "assets/images/superman.png",
    sets: 3,
    reps: 10,
    difficulty: "Medium"
  },
  {
    _id: "32",
    name: "Arm Curl with Dumbbells",
    description: "Stand straight holding dumbbells.\nCurl arms upward slowly.\nLower back down in a controlled manner.\nRepeat 12–15 times.\nDo three sets, moving carefully.",
    bodyPart: "arms",
    image: "assets/images/arm curl.png",
    sets: 3,
    reps: 15,
    difficulty: "Medium"
  },
  {
    _id: "33",
    name: "Standing Side Leg Lift",
    description: "Stand straight with feet together.\nLift one leg to the side slowly.\nHold for 2 seconds.\nLower back down.\nRepeat 12 times per leg.\nDo three sets, moving gently.",
    bodyPart: "hip",
    image: "assets/images/standing side leg lift.png",
    sets: 3,
    reps: 12,
    difficulty: "Medium"
  },
  {
    _id: "34",
    name: "Cat-Cow Stretch",
    description: "Start on hands and knees.\nArch your back upward (Cat) and hold briefly.\nLower your belly and lift your head (Cow).\nRepeat 10–15 times.\nDo three sets, moving slowly and gently.",
    bodyPart: "back",
    image: "assets/images/cat cow.png",
    sets: 3,
    reps: 15,
    difficulty: "Easy"
  },
  {
    _id: "35",
    name: "Standing Hamstring Stretch",
    description: "Stand straight with feet together.\nBend forward at your hips, reaching toward your toes.\nHold for 20 seconds.\nReturn to standing.\nRepeat 2–3 times, moving slowly and carefully.",
    bodyPart: "leg",
    image: "assets/images/standing hamstring stretch.png",
    sets: 3,
    reps: 1,
    difficulty: "Easy"
  }
];
