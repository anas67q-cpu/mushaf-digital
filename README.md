# Mushaf Digital

Create a fully Arabic Quran web application that looks and feels exactly like a real Mushaf (printed Quran), not a normal text-based Quran website.



I will attach reference images of the Mushaf pages. The final design should match them as closely as possible:

- Same page appearance.

- Same Uthmani Quran script.

- Same verse layout.

- Same page structure.

- Same Surah openings (especially Al-Fatihah and the beginning of Al-Baqarah).

- The user should feel like they are reading actual scanned Mushaf pages.



IMPORTANT:

Do NOT render Quran verses using normal web fonts (such as Amiri or any Arabic font).

Do NOT recreate the Quran text manually as HTML text.

Do NOT generate the Quran layout yourself.



The Quran pages must be displayed as high-quality Mushaf page images, exactly like the real printed Quran.



---



## Mushaf Display



- Use high-resolution Mushaf page images.

- Images must be sharp, clear, and optimized for mobile screens.

- The page should fill the screen beautifully.

- Support mobile, tablet, and desktop layouts.

- Support portrait and landscape modes.

- On iPad and mobile landscape mode, provide a comfortable reading view with smooth vertical scrolling.

- Maintain image quality without distortion.



---



## Page Navigation



The reading experience should work like a real Arabic Mushaf:



- Swiping from right to left moves to the next page.

- Swiping from left to right returns to the previous page.

- The direction must be true RTL.

- Do not reverse the gesture behavior.

- Page transitions should be smooth and natural like professional Quran apps.



---



## Interactive Layer Above Mushaf Images



Keep the Mushaf images unchanged.



Add an invisible interactive layer above the pages.



Each Ayah must have an accurate clickable area (hotspot).



The coordinates must be linked correctly to the exact Ayah.



Example:

If the user taps Ayah 10 of Surah Al-Kahf:



The system must correctly detect:

- Surah Al-Kahf

- Ayah number 10

- Correct page location



It must NEVER detect another Ayah (such as Ayah 11 or 12).



Accuracy is critical:

The Ayah coordinates and mapping must be 100% correct.



---



## Ayah Interaction



When the user taps an Ayah, show an Arabic action panel containing:



- Surah name.

- Ayah number.

- Ayah information.

- Tafsir of the selected Ayah.

- Add bookmark.

- Highlight Ayah.



Use Quran.com API or another trusted Quran API to retrieve:

- Surah data.

- Ayah information.

- Tafsir data.



The image-based Mushaf remains the main display source.



---



## Highlight System



Add an Ayah highlighting feature:



Requirements:

- 5 different highlight colors.

- Highlight should appear exactly behind the selected Ayah, similar to the provided reference image.

- Do not modify the Mushaf image itself.

- Use a transparent overlay layer.



Save highlight data permanently:



- Surah name.

- Surah number.

- Ayah number.

- Page number.

- Highlight color.

- Ayah coordinates.



When the user returns later, the highlight must appear in the exact same location.



---



## Bookmark System



Create a bookmark system connected with highlights.



Bookmarks should save:



- Surah name.

- Surah number.

- Ayah number.

- Page number.

- Highlight information (if available).



When the user opens a bookmark:

- Navigate directly to the correct Mushaf page.

- Show the exact selected Ayah.

- Restore its highlight if it exists.



---



## Quran API Integration



Use Quran.com API if possible.



Use it for:

- Surah information.

- Ayah metadata.

- Tafsir.



The API data should only support the interactive features.



The Quran display itself must remain image-based.



---



## Language and UI



- The entire website interface must be Arabic.

- Full RTL layout.

- Arabic menus, buttons, and navigation.

- Proper Arabic typography for UI elements only.



---



## iPhone and iPad Responsive Design



The website must be fully optimized for Apple devices, especially iPhone and iPad.



I will attach screenshots from the Ayah Quran app on:

- iPhone (small screen)

- iPad (large screen)



Use these screenshots as a visual reference for the layout, spacing, and reading experience.



The design should adapt perfectly to different screen sizes:



### iPhone:

- The Mushaf page should fit the smaller screen beautifully.

- The page should be readable without unnecessary empty spaces.

- Support portrait and landscape modes.

- Maintain smooth scrolling and comfortable reading.



### iPad:

- Provide a tablet-optimized layout.

- Take advantage of the larger screen size.

- Support landscape mode with a beautiful Quran reading layout.

- Allow smooth vertical scrolling when needed.

- Keep the Mushaf page centered and balanced.

- Do not simply stretch the iPhone layout; create a proper iPad experience.



The final experience should feel similar to the Ayah Quran app:

- Clean layout.

- Proper margins.

- Excellent readability.

- Smooth interaction.

- Perfect adaptation between small and large screens.



The attached iPhone and iPad screenshots are references for the expected responsive behavior and visual quality.

————



## Final Goal



Build a Quran web app that feels like a real Mushaf:



✅ Real Mushaf page images

✅ Original Quran page appearance

✅ Uthmani script through images, not generated text

✅ Correct RTL page swiping

✅ Accurate Ayah touch detection

✅ Ayah highlight system

✅ Bookmarks

✅ Tafsir integration

✅ Arabic RTL interface

✅ Share Ayah with tafseer or without in beautiful design picture 

The priority is visual accuracy and Quran reading experience. Do not replace the Mushaf image approach with text rendering.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/33d31e88-aaa9-4083-8f54-5859c5941dba).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
