import cv2
import mediapipe as mp
import numpy as np
import pygame

# Initialize webcam
cap = cv2.VideoCapture(0)
cap.set(3, 1280)
cap.set(4, 720)

# Initialize Mediapipe
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(max_num_hands=2, min_detection_confidence=0.7)
mp_draw = mp.solutions.drawing_utils

# Initialize Pygame mixer
pygame.mixer.init()
sounds = {
    "Kick": pygame.mixer.Sound("sounds/kick.wav"),
    "Snare": pygame.mixer.Sound("sounds/snare.wav"),
    "HiHat": pygame.mixer.Sound("sounds/hihat.wav"),
    "Tom1": pygame.mixer.Sound("sounds/tom1.wav"),
    "Tom2": pygame.mixer.Sound("sounds/tom2.wav"),
    "Cymbal": pygame.mixer.Sound("sounds/cymbal.wav")
}

# Define 6 centered drum zones (clean layout)
drum_zones = {
    "Kick": (100, 400, 300, 600),
    "Snare": (350, 400, 550, 600),
    "HiHat": (600, 400, 800, 600),
    "Tom1": (850, 400, 1050, 600),
    "Tom2": (400, 100, 600, 300),
    "Cymbal": (700, 100, 900, 300)
}

zone_colors = {
    "Kick": (255, 0, 0),
    "Snare": (0, 255, 0),
    "HiHat": (0, 0, 255),
    "Tom1": (255, 255, 0),
    "Tom2": (255, 0, 255),
    "Cymbal": (0, 255, 255)
}

# Track previous zones for each hand and finger
# Structure: prev_zone["Left"]["Index"], prev_zone["Left"]["Middle"]
prev_zone = {
    "Left": {"Index": None, "Middle": None},
    "Right": {"Index": None, "Middle": None}
}

while True:
    success, frame = cap.read()
    if not success:
        break

    frame = cv2.flip(frame, 1)
    h, w, _ = frame.shape
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb)

    # Draw translucent zones
    overlay = frame.copy()
    for name, (x1, y1, x2, y2) in drum_zones.items():
        cv2.rectangle(overlay, (x1, y1), (x2, y2), zone_colors[name], -1)
        cv2.putText(overlay, name, (x1 + 15, y1 + 45),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.1, (255, 255, 255), 3)
    frame = cv2.addWeighted(overlay, 0.25, frame, 0.75, 0)

    if results.multi_hand_landmarks:
        for hand_landmarks, hand_info in zip(results.multi_hand_landmarks, results.multi_handedness):
            label = hand_info.classification[0].label  # "Left" or "Right"
            mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

            # Fingertip coordinates for index (8) and middle (12)
            finger_points = {
                "Index": (int(hand_landmarks.landmark[8].x * w),
                          int(hand_landmarks.landmark[8].y * h)),
                "Middle": (int(hand_landmarks.landmark[12].x * w),
                           int(hand_landmarks.landmark[12].y * h))
            }

            for finger_name, (fx, fy) in finger_points.items():
                cv2.circle(frame, (fx, fy), 10, (0, 0, 255), cv2.FILLED)

                current_zone = None
                for name, (x1, y1, x2, y2) in drum_zones.items():
                    if x1 < fx < x2 and y1 < fy < y2:
                        current_zone = name
                        break

                # Play only once per entry
                if current_zone and prev_zone[label][finger_name] != current_zone:
                    sounds[current_zone].set_volume(0.9)
                    sounds[current_zone].play()
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 255, 255), 8)

                # Update previous zone for this finger
                prev_zone[label][finger_name] = current_zone
    else:
        # Reset all previous zones if no hand detected
        prev_zone = {
            "Left": {"Index": None, "Middle": None},
            "Right": {"Index": None, "Middle": None}
        }

    cv2.imshow("Virtual Drum", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
