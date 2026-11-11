export interface Dua {
  id: string;
  title: string;
  titleAr: string;
  ar: string;
  en: string;
  ref: string;
}

export const DUAS: Dua[] = [
  {
    id: 'waking',
    title: 'Upon waking',
    titleAr: 'دعاء الاستيقاظ',
    ar: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    en: 'All praise is for Allah who gave us life after having taken it from us, and to Him is the resurrection.',
    ref: 'Bukhari',
  },
  {
    id: 'sleeping',
    title: 'Before sleeping',
    titleAr: 'دعاء النوم',
    ar: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    en: 'In Your name, O Allah, I die and I live.',
    ref: 'Bukhari',
  },
  {
    id: 'distress',
    title: 'In distress',
    titleAr: 'دعاء الكرب',
    ar: 'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
    en: 'There is no god but You. Glory be to You. Indeed, I have been of the wrongdoers.',
    ref: 'Quran 21:87 · the supplication of Yunus ﷺ',
  },
  {
    id: 'knowledge',
    title: 'For beneficial knowledge',
    titleAr: 'دعاء طلب العلم',
    ar: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا',
    en: 'O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds.',
    ref: 'Ibn Majah',
  },
  {
    id: 'rizq',
    title: 'For sufficiency',
    titleAr: 'دعاء الكفاية',
    ar: 'اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ',
    en: 'O Allah, suffice me with what You have permitted against what You have forbidden, and enrich me by Your grace from all besides You.',
    ref: 'Tirmidhi',
  },
  {
    id: 'parents',
    title: 'For parents',
    titleAr: 'دعاء الوالدين',
    ar: 'رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    en: 'My Lord, have mercy upon them as they brought me up when I was small.',
    ref: 'Quran 17:24',
  },
  {
    id: 'forgiveness',
    title: 'For forgiveness',
    titleAr: 'دعاء الاستغفار',
    ar: 'رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ',
    en: 'Our Lord, we have wronged ourselves. If You do not forgive us and have mercy upon us, we will surely be among the losers.',
    ref: 'Quran 7:23',
  },
  {
    id: 'travel',
    title: 'For travel',
    titleAr: 'دعاء السفر',
    ar: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
    en: 'Glory to Him who has subjected this to us, and we could never have accomplished it ourselves; and to our Lord we will surely return.',
    ref: 'Quran 43:13-14',
  },
  {
    id: 'food',
    title: 'After eating',
    titleAr: 'دعاء بعد الطعام',
    ar: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
    en: 'All praise is for Allah who fed me this and provided it for me without any might or power on my part.',
    ref: 'Tirmidhi, Abu Dawud',
  },
  {
    id: 'rain',
    title: 'When it rains',
    titleAr: 'دعاء المطر',
    ar: 'اللَّهُمَّ صَيِّبًا نَافِعًا',
    en: 'O Allah, let it be a beneficial downpour.',
    ref: 'Bukhari',
  },
  {
    id: 'masjid',
    title: 'Entering the mosque',
    titleAr: 'دعاء دخول المسجد',
    ar: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    en: 'O Allah, open for me the gates of Your mercy.',
    ref: 'Muslim',
  },
  {
    id: 'salawat',
    title: 'Sending blessings on the Prophet ﷺ',
    titleAr: 'الصلاة على النبي ﷺ',
    ar: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
    en: 'O Allah, send prayers and peace upon our Prophet Muhammad ﷺ.',
    ref: 'Muslim',
  },
];

export const DAILY_REMINDERS: { ar: string; en: string; ref: string }[] = [
  {
    ar: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    en: 'Indeed, with hardship comes ease.',
    ref: 'Quran 94:6',
  },
  {
    ar: 'وَمَنْ يَتَّقِ اللَّهَ يَجْعَلْ لَهُ مَخْرَجًا',
    en: 'Whoever is mindful of Allah, He will make a way out for them.',
    ref: 'Quran 65:2',
  },
  {
    ar: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    en: 'Surely in the remembrance of Allah do hearts find rest.',
    ref: 'Quran 13:28',
  },
  {
    ar: 'وَاللَّهُ خَيْرٌ حَافِظًا ۖ وَهُوَ أَرْحَمُ الرَّاحِمِينَ',
    en: 'Allah is the best Guardian, and He is the Most Merciful of the merciful.',
    ref: 'Quran 12:64',
  },
  {
    ar: 'وَقُلْ رَبِّ زِدْنِي عِلْمًا',
    en: 'And say: My Lord, increase me in knowledge.',
    ref: 'Quran 20:114',
  },
  {
    ar: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ',
    en: 'So remember Me; I will remember you. Be thankful to Me and do not deny Me.',
    ref: 'Quran 2:152',
  },
  {
    ar: 'وَعَسَىٰ أَنْ تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَكُمْ',
    en: 'Perhaps you dislike something while it is good for you.',
    ref: 'Quran 2:216',
  },
  {
    ar: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
    en: 'Indeed, Allah is with the patient.',
    ref: 'Quran 2:153',
  },
  {
    ar: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
    en: 'Allah is sufficient for us, and He is the best Disposer of affairs.',
    ref: 'Quran 3:173',
  },
];
