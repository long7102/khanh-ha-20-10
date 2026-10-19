// Add the title and short paragraph for each numbered picture here.
// The numbers follow the existing short-to-long hair ordering.
window.HA_MEMORIES = Array.from({ length: 27 }, (_, index) => ({
  photo: index + 1,
  title: `Khánh Hạ · khung hình ${String(index + 1).padStart(2, '0')}`,
  paragraph: '' // Add the memory or a message here when ready.
}));

// Messages on the backs of the four featured polaroids.
window.HA_FEATURED_MESSAGES = [
  { title: 'Luôn là em nhé', message: 'Dù tóc ngắn hay tóc dài (dài vẫn tốt hơn), mong Khánh Hạ của anh luôn tự tin và yêu thương bản thân mình nhiều hơn. Chúc em 20/10 thật rạng rỡ. ♡' },
  { title: 'Một ngày thật dịu dàng', message: 'Mong em được yêu thương, được lắng nghe và có thời gian cho những điều em thích, những người em yêu thương - hôm nay và cả những ngày sau. ✿' },
  { title: 'Dành cho những ước mơ', message: 'Chúc những nét vẽ, những dự định và những điều em ấp ủ đều có cơ hội lớn lên và nở thành những bông hoa xinh đẹp như em. Anh sẽ đồng hành bên em. ✦' },
  { title: 'Ngày của người lùn', message: '20/10 này, chúc cô gái siêu nhỏ của anh có thật nhiều niềm vui, thật nhiều bình yên và thật nhiều lý do để mỉm cười. ♡' }
];

