## 🌍 Multi-language Address
https://www.yuque.com/zhangyurang/ghwvmn/idhcg59wc2204o5n#Ah4t

### Example
_On Jan. 20, former Sen. Barack Obama became the 44th President of the U.S. Millions attended the Inauguration._

- `sentence-tokenizer`: works for sentence splitting, but cannot recognize example sentences.  
- `sentence-splitter`: fails at splitting correctly (breaks sentences inside quotes with `?` or `!`), but can recognize example sentences.  

🔗 https://github.com/Tessmore/sbd  
- Cannot recognize:  
  `Mr.James Scott has a garage in Silbury and now he has just bought another garage in Pinhurst.`  
- Splits at `Mr.James` incorrectly.  

`wink-nlp`  
- `'What a day!' I thought. 'What are you doing?' she asked.`  
- Gets split into wrong sentences.  

`compromise`  
- Performs well, also includes built-in word segmentation.  

👉 All of the above libraries split:  
`'Do you always get up so late? It's one o'clock!'`  
into **two sentences**...

---

## 🐞 Bugs and Improvements

1. **Error notebook**: add error count display.  
2. **Bug**: no sound when changing paragraphs.  
3. At the end of a paragraph, last line does not auto-wrap — space key is required.  
4. After finishing text, sometimes end is not detected.  
5. All icons have **hover zoom effect**.  
6. Sounds should have **individual volume control**.  
7. Lists should support **search**.  
8. `BaseIcon`: when selected, should display in **white**.  
9. Adding article: input `123` causes error.  
10. When no content, show **placeholder**.  
11. `"A cold welcome"` has a bug.  
12. `EditAbleText.vue` does not auto-focus.  
13. Word pronunciation: second click should **slow down**.  
14. Reference: http://enpuz.com/ (grammar analysis tool).  
15. Keyboard sound effects should repeat more times.  
16. Show **loading** when loading word list.  
17. Clicking a sentence to play audio should allow **pause**.  
18. Footer input stats issue:  
    - Selecting from list then making a mistake → not counted.  
    - Happens for both words and articles.  
19. `nce1-16. A polite request.` parsing issue.  
20. Example note:  
    ```
    'Sir, we welcome you to our city. This is a 'No Parking' area. You will enjoy your stay here if you pay attention to our street signs. This note is only a reminder.'
    ```
    - If you receive such a request, you cannot ignore it.  
    - Problem: `'No Parking'` is incorrectly split.  
