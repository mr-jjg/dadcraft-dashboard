package models

type LeaderboardEntry struct {
    Level      int    `json:"level"`
    Name       string `json:"name"`
    Race       string `json:"race"`
    Class      string `json:"class"`
    Online     bool   `json:"online"`
    DingTime   int64  `json:"ding_time"`
    Efficiency int64  `json:"efficiency"`
}
