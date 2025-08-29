# Study 2 - 24 Webpage Conditions

## Factorial Design: 2 (counterspeaker) × 2 (offense) × 3 (counterspeech type) × 2 (specific message) = 24 conditions

### Base URL: http://localhost:3000/staticvideo

---

## **HUMAN COUNTERSPEAKER (speaker=1)**

### **Offense Type: RUDE** (offense=rude)

#### **Moral Norm (mo) Counterspeech:**
1. `http://localhost:3000/staticvideo?speaker=1&offense=rude&mo=0`
2. `http://localhost:3000/staticvideo?speaker=1&offense=rude&mo=1`

#### **Empathy (em) Counterspeech:**
3. `http://localhost:3000/staticvideo?speaker=1&offense=rude&em=0`
4. `http://localhost:3000/staticvideo?speaker=1&offense=rude&em=1`

#### **Empathy Subjective (em_sub) Counterspeech:**
5. `http://localhost:3000/staticvideo?speaker=1&offense=rude&em_sub=0`
6. `http://localhost:3000/staticvideo?speaker=1&offense=rude&em_sub=1`

### **Offense Type: HATE** (offense=hate)

#### **Moral Norm (mo) Counterspeech:**
7. `http://localhost:3000/staticvideo?speaker=1&offense=hate&mo=0`
8. `http://localhost:3000/staticvideo?speaker=1&offense=hate&mo=1`

#### **Empathy (em) Counterspeech:**
9. `http://localhost:3000/staticvideo?speaker=1&offense=hate&em=0`
10. `http://localhost:3000/staticvideo?speaker=1&offense=hate&em=1`

#### **Empathy Subjective (em_sub) Counterspeech:**
11. `http://localhost:3000/staticvideo?speaker=1&offense=hate&em_sub=0`
12. `http://localhost:3000/staticvideo?speaker=1&offense=hate&em_sub=1`

---

## **AI COUNTERSPEAKER (speaker=2)**

### **Offense Type: RUDE** (offense=rude)

#### **Moral Norm (mo) Counterspeech:**
13. `http://localhost:3000/staticvideo?speaker=2&offense=rude&mo=0`
14. `http://localhost:3000/staticvideo?speaker=2&offense=rude&mo=1`

#### **Empathy (em) Counterspeech:**
15. `http://localhost:3000/staticvideo?speaker=2&offense=rude&em=0`
16. `http://localhost:3000/staticvideo?speaker=2&offense=rude&em=1`

#### **Empathy Subjective (em_sub) Counterspeech:**
17. `http://localhost:3000/staticvideo?speaker=2&offense=rude&em_sub=0`
18. `http://localhost:3000/staticvideo?speaker=2&offense=rude&em_sub=1`

### **Offense Type: HATE** (offense=hate)

#### **Moral Norm (mo) Counterspeech:**
19. `http://localhost:3000/staticvideo?speaker=2&offense=hate&mo=0`
20. `http://localhost:3000/staticvideo?speaker=2&offense=hate&mo=1`

#### **Empathy (em) Counterspeech:**
21. `http://localhost:3000/staticvideo?speaker=2&offense=hate&em=0`
22. `http://localhost:3000/staticvideo?speaker=2&offense=hate&em=1`

#### **Empathy Subjective (em_sub) Counterspeech:**
23. `http://localhost:3000/staticvideo?speaker=2&offense=hate&em_sub=0`
24. `http://localhost:3000/staticvideo?speaker=2&offense=hate&em_sub=1`

---

## **Parameter Explanation:**
- **speaker**: `1` (human counterspeaker) or `2` (AI counterspeaker)
- **offense**: `rude` or `hate` (type of offensive message)
- **mo**: `0` or `1` (moral norm appeal message variants)
- **em**: `0` or `1` (empathy appeal message variants)
- **em_sub**: `0` or `1` (empathy subjective message variants)

## **Factorial Structure:**
```
Factor 1: Counterspeaker (2 levels)
├── Human (speaker=1)
└── AI (speaker=2)

Factor 2: Offense Type (2 levels)
├── Rude (offense=rude)
└── Hate (offense=hate)

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
