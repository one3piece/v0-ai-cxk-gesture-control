// MediaPipe Hand Landmark indices
// 0: WRIST
// 4: THUMB_TIP, 3: THUMB_IP, 2: THUMB_MCP
// 8: INDEX_FINGER_TIP, 7: INDEX_FINGER_DIP, 6: INDEX_FINGER_PIP, 5: INDEX_FINGER_MCP
// 12: MIDDLE_FINGER_TIP, 11: MIDDLE_FINGER_DIP, 10: MIDDLE_FINGER_PIP
// 16: RING_FINGER_TIP, 15: RING_FINGER_DIP, 14: RING_FINGER_PIP
// 20: PINKY_TIP, 19: PINKY_DIP, 18: PINKY_PIP

export type GestureType =
  | "none"
  | "open_palm"
  | "fist"
  | "ok"
  | "swipe_left"
  | "swipe_right"
  | "two_hands"

export interface HandLandmark {
  x: number
  y: number
  z: number
}

interface SwipeTracker {
  positions: { x: number; time: number }[]
  lastSwipeTime: number
}

const swipeTracker: SwipeTracker = {
  positions: [],
  lastSwipeTime: 0,
}

function isFingerExtended(landmarks: HandLandmark[], tipIdx: number, pipIdx: number): boolean {
  return landmarks[tipIdx].y < landmarks[pipIdx].y
}

function isThumbExtended(landmarks: HandLandmark[]): boolean {
  // Thumb is extended if tip is further from palm center than IP joint
  const thumbTip = landmarks[4]
  const thumbIp = landmarks[3]
  const wrist = landmarks[0]

  const tipDist = Math.abs(thumbTip.x - wrist.x)
  const ipDist = Math.abs(thumbIp.x - wrist.x)
  return tipDist > ipDist
}

function distance(a: HandLandmark, b: HandLandmark): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

export function detectGesture(
  handsLandmarks: HandLandmark[][],
): GestureType {
  if (handsLandmarks.length === 0) return "none"

  // Two hands raised
  if (handsLandmarks.length >= 2) {
    const hand1Open = isOpenPalm(handsLandmarks[0])
    const hand2Open = isOpenPalm(handsLandmarks[1])
    if (hand1Open && hand2Open) return "two_hands"
  }

  const landmarks = handsLandmarks[0]

  // Check for swipe
  const now = Date.now()
  const wristX = landmarks[0].x
  swipeTracker.positions.push({ x: wristX, time: now })

  // Keep only last 300ms of data
  swipeTracker.positions = swipeTracker.positions.filter(
    (p) => now - p.time < 300
  )

  if (
    swipeTracker.positions.length >= 3 &&
    now - swipeTracker.lastSwipeTime > 600
  ) {
    const first = swipeTracker.positions[0]
    const last = swipeTracker.positions[swipeTracker.positions.length - 1]
    const deltaX = last.x - first.x
    const timeDelta = last.time - first.time

    if (timeDelta > 50 && Math.abs(deltaX) > 0.12) {
      swipeTracker.lastSwipeTime = now
      swipeTracker.positions = []
      // MediaPipe mirrors: positive deltaX = visual left
      return deltaX > 0 ? "swipe_left" : "swipe_right"
    }
  }

  // OK gesture: thumb tip close to index tip, other fingers extended
  if (isOkGesture(landmarks)) return "ok"

  // Open palm: all fingers extended
  if (isOpenPalm(landmarks)) return "open_palm"

  // Fist: all fingers closed
  if (isFist(landmarks)) return "fist"

  return "none"
}

function isOpenPalm(landmarks: HandLandmark[]): boolean {
  const indexExt = isFingerExtended(landmarks, 8, 6)
  const middleExt = isFingerExtended(landmarks, 12, 10)
  const ringExt = isFingerExtended(landmarks, 16, 14)
  const pinkyExt = isFingerExtended(landmarks, 20, 18)
  return indexExt && middleExt && ringExt && pinkyExt
}

function isFist(landmarks: HandLandmark[]): boolean {
  const indexClosed = !isFingerExtended(landmarks, 8, 6)
  const middleClosed = !isFingerExtended(landmarks, 12, 10)
  const ringClosed = !isFingerExtended(landmarks, 16, 14)
  const pinkyClosed = !isFingerExtended(landmarks, 20, 18)
  return indexClosed && middleClosed && ringClosed && pinkyClosed
}

function isOkGesture(landmarks: HandLandmark[]): boolean {
  const thumbTip = landmarks[4]
  const indexTip = landmarks[8]
  const dist = distance(thumbTip, indexTip)

  // Thumb and index tips close together
  const tipsClose = dist < 0.06

  // Other fingers should be relatively extended
  const middleExt = isFingerExtended(landmarks, 12, 10)
  const ringExt = isFingerExtended(landmarks, 16, 14)

  return tipsClose && (middleExt || ringExt)
}

// Debounce gesture detection to avoid flickering
export class GestureDebouncer {
  private lastGesture: GestureType = "none"
  private gestureCount = 0
  private threshold: number

  constructor(threshold = 3) {
    this.threshold = threshold
  }

  update(gesture: GestureType): GestureType {
    if (gesture === this.lastGesture) {
      this.gestureCount++
    } else {
      this.lastGesture = gesture
      this.gestureCount = 1
    }

    if (this.gestureCount >= this.threshold) {
      return gesture
    }

    return "none"
  }

  reset() {
    this.lastGesture = "none"
    this.gestureCount = 0
  }
}
