export interface Dhikr {
  ar: string;
  en: string;
  ref: string;
  count: number;
}

export interface DhikrSet {
  id: string;
  title: string;
  titleAr: string;
  items: Dhikr[];
}

export const MORNING_ADHKAR: Dhikr[] = [
  {
    ar: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ. اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    en: 'Ayat al-Kursi (2:255). Whoever recites it in the morning will be protected until evening.',
    ref: 'Quran 2:255 · Hakim',
    count: 1,
  },
  {
    ar: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ',
    en: 'Say: He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born, nor is there to Him any equivalent. (Al-Ikhlas)',
    ref: 'Quran 112 · repeat 3×',
    count: 3,
  },
  {
    ar: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِنْ شَرِّ مَا خَلَقَ ۝ وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ',
    en: 'Say: I seek refuge in the Lord of daybreak… from the evil of that which He created, the evil of darkness when it settles, the evil of the blowers in knots, and the evil of an envier when he envies. (Al-Falaq)',
    ref: 'Quran 113 · repeat 3×',
    count: 3,
  },
  {
    ar: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ',
    en: 'Say: I seek refuge in the Lord of mankind, the Sovereign of mankind, the God of mankind, from the evil of the retreating whisperer… (An-Nas)',
    ref: 'Quran 114 · repeat 3×',
    count: 3,
  },
  {
    ar: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
    en: 'We have entered the morning and the dominion belongs to Allah… My Lord, I ask You for the good of this day and the good after it, and I seek refuge in You from the evil of this day and the evil after it.',
    ref: 'Muslim',
    count: 1,
  },
  {
    ar: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
    en: 'O Allah, You are my Lord, there is no god but You. You created me and I am Your servant… I acknowledge Your favour upon me and I acknowledge my sin, so forgive me, for none forgives sins but You. (Sayyid al-Istighfar)',
    ref: 'Bukhari',
    count: 1,
  },
  {
    ar: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',
    en: 'O Allah, by You we enter the morning and by You we enter the evening; by You we live and by You we die, and to You is the resurrection.',
    ref: 'Tirmidhi',
    count: 1,
  },
  {
    ar: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ ﷺ نَبِيًّا',
    en: 'I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad ﷺ as my Prophet.',
    ref: 'Abu Dawud · repeat 3×',
    count: 3,
  },
  {
    ar: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ',
    en: 'O Allah, grant me well-being in my body, my hearing and my sight. There is no god but You.',
    ref: 'Abu Dawud · repeat 3×',
    count: 3,
  },
  {
    ar: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    en: 'In the name of Allah, with whose name nothing on earth or in heaven can cause harm; He is the All-Hearing, the All-Knowing.',
    ref: 'Abu Dawud, Tirmidhi · repeat 3×',
    count: 3,
  },
  {
    ar: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
    en: 'Allah is sufficient for me; there is no god but Him. In Him I place my trust, and He is the Lord of the Mighty Throne.',
    ref: 'Abu Dawud · repeat 7×',
    count: 7,
  },
  {
    ar: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    en: 'Glory be to Allah and praise be to Him.',
    ref: 'Muslim · repeat 100×',
    count: 100,
  },
];

export const EVENING_ADHKAR: Dhikr[] = MORNING_ADHKAR.map((d, i) => {
  if (i === 4) {
    return {
      ...d,
      ar: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
      en: 'We have entered the evening and the dominion belongs to Allah… My Lord, I ask You for the good of this night and the good after it…',
    };
  }
  return d;
});

export const POST_PRAYER_ADHKAR: Dhikr[] = [
  {
    ar: 'أَسْتَغْفِرُ اللَّهَ',
    en: 'I seek the forgiveness of Allah.',
    ref: 'Muslim · repeat 3×',
    count: 3,
  },
  {
    ar: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
    en: 'O Allah, You are Peace and from You comes peace. Blessed are You, O Owner of Majesty and Generosity.',
    ref: 'Muslim',
    count: 1,
  },
  {
    ar: 'سُبْحَانَ اللَّهِ',
    en: 'Glory be to Allah.',
    ref: 'Muslim · repeat 33×',
    count: 33,
  },
  {
    ar: 'الْحَمْدُ لِلَّهِ',
    en: 'All praise is due to Allah.',
    ref: 'Muslim · repeat 33×',
    count: 33,
  },
  {
    ar: 'اللَّهُ أَكْبَرُ',
    en: 'Allah is the Greatest.',
    ref: 'Muslim · repeat 33×',
    count: 33,
  },
  {
    ar: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
    en: 'There is no god but Allah alone, without partner. His is the dominion and His is the praise, and He is able to do all things.',
    ref: 'Muslim · completes the set and erases sins',
    count: 1,
  },
];

export const TASBEEH_PRESETS = [
  { label: 'SubhanAllah', ar: 'سُبْحَانَ اللَّهِ', target: 33 },
  { label: 'Alhamdulillah', ar: 'الْحَمْدُ لِلَّهِ', target: 33 },
  { label: 'Allahu Akbar', ar: 'اللَّهُ أَكْبَرُ', target: 34 },
  { label: 'La ilaha illa Allah', ar: 'لَا إِلَهَ إِلَّا اللَّهُ', target: 100 },
  { label: 'Astaghfirullah', ar: 'أَسْتَغْفِرُ اللَّهَ', target: 100 },
  { label: 'Salawat', ar: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', target: 100 },
];
