# Study 2 - 24 Webpage Conditions

## Factorial Design: 2 (counterspeaker) × 2 (offense) × 3 (counterspeech type) × 2 (specific message) = 24 conditions

### Base URL: http://localhost:3000/staticvideo

---

## **HUMAN COUNTERSPEAKER (speak=1)**

### **Offense Type: RUDE** (off=ru)

#### **Moral Norm (mo) Counterspeech:**
1. `http://localhost:3000/staticvideo?speak=1&off=ru&mo=0`
2. `http://localhost:3000/staticvideo?speak=1&off=ru&mo=1`

#### **Empathy (em) Counterspeech:**
3. `http://localhost:3000/staticvideo?speak=1&off=ru&em=0`
4. `http://localhost:3000/staticvideo?speak=1&off=ru&em=1`

#### **Empathy Subjective (em_sub) Counterspeech:**
5. `http://localhost:3000/staticvideo?speak=1&off=ru&em_sub=0`
6. `http://localhost:3000/staticvideo?speak=1&off=ru&em_sub=1`

### **Offense Type: HATE** (off=ha)

#### **Moral Norm (mo) Counterspeech:**
7. `http://localhost:3000/staticvideo?speak=1&off=ha&mo=0`
8. `http://localhost:3000/staticvideo?speak=1&off=ha&mo=1`

#### **Empathy (em) Counterspeech:**
9. `http://localhost:3000/staticvideo?speak=1&off=ha&em=0`
10. `http://localhost:3000/staticvideo?speak=1&off=ha&em=1`

#### **Empathy Subjective (em_sub) Counterspeech:**
11. `http://localhost:3000/staticvideo?speak=1&off=ha&em_sub=0`
12. `http://localhost:3000/staticvideo?speak=1&off=ha&em_sub=1`

---

## **AI COUNTERSPEAKER (speak=2)**

### **Offense Type: RUDE** (off=ru)

#### **Moral Norm (mo) Counterspeech:**
13. `http://localhost:3000/staticvideo?speak=2&off=ru&mo=0`
14. `http://localhost:3000/staticvideo?speak=2&off=ru&mo=1`

#### **Empathy (em) Counterspeech:**
15. `http://localhost:3000/staticvideo?speak=2&off=ru&em=0`
16. `http://localhost:3000/staticvideo?speak=2&off=ru&em=1`

#### **Empathy Subjective (em_sub) Counterspeech:**
17. `http://localhost:3000/staticvideo?speak=2&off=ru&em_sub=0`
18. `http://localhost:3000/staticvideo?speak=2&off=ru&em_sub=1`

### **Offense Type: HATE** (off=ha)

#### **Moral Norm (mo) Counterspeech:**
19. `http://localhost:3000/staticvideo?speak=2&off=ha&mo=0`
20. `http://localhost:3000/staticvideo?speak=2&off=ha&mo=1`

#### **Empathy (em) Counterspeech:**
21. `http://localhost:3000/staticvideo?speak=2&off=ha&em=0`
22. `http://localhost:3000/staticvideo?speak=2&off=ha&em=1`

#### **Empathy Subjective (em_sub) Counterspeech:**
23. `http://localhost:3000/staticvideo?speak=2&off=ha&em_sub=0`
24. `http://localhost:3000/staticvideo?speak=2&off=ha&em_sub=1`

---

## **Parameter Explanation:**
- **speaker**: `1` (human counterspeaker) or `2` (AI counterspeaker)
- **off**: `ru` (rude) or `ha` (hate) - type of offensive message
- **mo**: `0` or `1` (moral norm appeal message variants)
- **em**: `0` or `1` (empathy appeal message variants)
- **em_sub**: `0` or `1` (empathy subjective message variants)

## **Factorial Structure:**
```
Factor 1: Counterspeaker (2 levels)
├── Human (speak=1)
└── AI (speak=2)

Factor 2: Offense Type (2 levels)
├── Rude (off=ru)
└── Hate (off=ha)

Factor 3: Counterspeech Type (3 levels)
├── Moral Norm (mo)
├── Empathy (em)
└── Empathy Subjective (em_sub)

Factor 4: Specific Message (2 levels)
├── Message 0 (=0)
└── Message 1 (=1)
```

## **Random Assignment:**
For random assignment, you can use these 24 URLs and distribute participants across them using your survey platform or a randomization script.
