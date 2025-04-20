const mongoose = require('mongoose')
const bcrypt = require('../../utils/bcrypt')
const User = require('../../models/User')
const Post = require('../../models/Post')
const Conversation = require('../../models/Conversation')
const Message = require('../../models/Message')
const Notification = require('../../models/Notification')

// Hàm tính khoảng cách giữa hai điểm dùng cho seeder
function calculateDistance(coords1, coords2) {
  // Haversine formula để tính khoảng cách giữa hai điểm trên trái đất
  const toRad = value => value * Math.PI / 180;
  
  const R = 6371; // Bán kính trái đất tính bằng km
  const dLat = toRad(coords2[1] - coords1[1]);
  const dLon = toRad(coords2[0] - coords1[0]);
  
  const lat1 = toRad(coords1[1]);
  const lat2 = toRad(coords2[1]);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance;
}

// Hàm tạo tọa độ ngẫu nhiên trong phạm vi của tọa độ gốc và khoảng cách tối đa
function generateRandomCoordinates(baseCoords, maxDistanceKm) {
  // Chuyển đổi khoảng cách km sang độ
  // 1 độ ~ 111km
  const maxDegrees = maxDistanceKm / 111;
  
  // Tạo offset ngẫu nhiên trong phạm vi -maxDegrees đến +maxDegrees
  const latOffset = (Math.random() * 2 - 1) * maxDegrees;
  const lngOffset = (Math.random() * 2 - 1) * maxDegrees;
  
  return [
    baseCoords[0] + lngOffset,
    baseCoords[1] + latOffset
  ];
}

async function seedUsers() {
  try {
    console.log('Seeding users...')
    
    await User.deleteMany({})
    
    const hashedPassword = await bcrypt.hashPassword('123456')
    
    // Tọa độ trung tâm Hà Nội
    const hanoi = [105.8342, 21.0278];
    
    // Tọa độ trung tâm Đà Nẵng
    const danang = [108.2022, 16.0544];
    
    // Tọa độ một số quận/khu vực trong Đà Nẵng
    const danangAreas = {
      haiChau: [108.2208, 16.0472], // Quận Hải Châu
      thanhKhe: [108.1861, 16.0639], // Quận Thanh Khê
      lieuChieu: [108.1372, 16.0787], // Quận Liên Chiểu
      camLe: [108.2097, 16.0228], // Quận Cẩm Lệ
      sonTra: [108.2789, 16.1065], // Quận Sơn Trà
      nguHanhSon: [108.2445, 16.0162], // Quận Ngũ Hành Sơn
      hoaVang: [108.1327, 15.9785], // Huyện Hòa Vang
      myKhe: [108.2462, 16.0520], // Bãi biển Mỹ Khê
      baNa: [107.9991, 15.9977], // Bà Nà Hills
      hoianNearby: [108.3293, 15.8801], // Gần Hội An
    };
    
    const users = [
      // User chính để test matching
      {
        name: 'Puck luv Perfume',
        email: 'nguyenhuuphuc@gmail.com',
        password: hashedPassword,
        birthday: new Date('2004-05-22'), // 21 tuổi
        location: {
          type: 'Point',
          coordinates: hanoi
        },
        hobbies: ['đọc sách', 'du lịch', 'chơi game'],
        avatar: 'https://example.com/avatars/phuc.jpg',
        profileImgs: ['https://example.com/profiles/phuc1.jpg', 'https://example.com/profiles/phuc2.jpg'],
        description: 'Tôi là 1 lập trình viên biết sử dụng chat GPT.',
        gender: 'male',
        preference: {
          gender: 'female',
          maxDistance: 30,
          minAge: 20,
          maxAge: 30
        },
        skippedUsers: []
      },
      // Các users nữ trong độ tuổi và khoảng cách phù hợp (nên match)
      {
        name: 'Nguyễn Thị Mai',
        email: 'mainguyen@gmail.com',
        password: hashedPassword,
        birthday: new Date('2004-08-22'), // 21 tuổi
        location: {
          type: 'Point',
          coordinates: generateRandomCoordinates(hanoi, 5) // 5km
        },
        hobbies: ['đọc sách', 'du lịch', 'xem phim'],
        avatar: 'https://example.com/avatars/mai.jpg',
        profileImgs: ['https://example.com/profiles/mai1.jpg'],
        description: 'Thích khám phá những điều mới mẻ và gặp gỡ người mới.',
        gender: 'female',
        preference: {
          gender: 'male',
          maxDistance: 25,
          minAge: 20,
          maxAge: 35
        },
        skippedUsers: []
      },
      {
        name: 'Lê Thị Hương',
        email: 'huongle@gmail.com',
        password: hashedPassword,
        birthday: new Date('2003-03-12'), // 22 tuổi
        location: {
          type: 'Point',
          coordinates: generateRandomCoordinates(hanoi, 10) // 10km
        },
        hobbies: ['đọc sách', 'yoga', 'nấu ăn'],
        avatar: 'https://example.com/avatars/huong.jpg',
        profileImgs: [],
        description: 'Yêu thiên nhiên và động vật.',
        gender: 'female',
        preference: {
          gender: 'male',
          maxDistance: 30,
          minAge: 21,
          maxAge: 35
        },
        skippedUsers: []
      },
      {
        name: 'Trần Thị Hà',
        email: 'hatran@gmail.com',
        password: hashedPassword,
        birthday: new Date('2000-06-18'), // 25 tuổi
        location: {
          type: 'Point',
          coordinates: generateRandomCoordinates(hanoi, 20) // 20km
        },
        hobbies: ['du lịch', 'chơi game', 'chụp ảnh'],
        avatar: 'https://example.com/avatars/ha.jpg',
        profileImgs: [],
        description: 'Thích phiêu lưu và trải nghiệm mới.',
        gender: 'female',
        preference: {
          gender: 'any',
          maxDistance: 40,
          minAge: 22,
          maxAge: 38
        },
        skippedUsers: []
      },
      // User nữ nhưng khoảng cách xa (không nên match)
      {
        name: 'Phạm Thị Lan',
        email: 'lanpham@gmail.com',
        password: hashedPassword,
        birthday: new Date('2002-11-05'), // 23 tuổi
        location: {
          type: 'Point',
          coordinates: generateRandomCoordinates(hanoi, 45) // 45km - quá xa
        },
        hobbies: ['đọc sách', 'chơi game'],
        avatar: 'https://example.com/avatars/lan.jpg',
        profileImgs: [],
        description: 'Sống chậm và tận hưởng.',
        gender: 'female',
        preference: {
          gender: 'male',
          maxDistance: 20,
          minAge: 20,
          maxAge: 30
        },
        skippedUsers: []
      },
      // User nữ nhưng ngoài độ tuổi ưa thích (không nên match)
      {
        name: 'Vũ Thị Trang',
        email: 'trangvu@gmail.com',
        password: hashedPassword,
        birthday: new Date('1994-04-20'), // 31 tuổi - quá lớn
        location: {
          type: 'Point',
          coordinates: generateRandomCoordinates(hanoi, 15) // 15km
        },
        hobbies: ['du lịch', 'yoga'],
        avatar: 'https://example.com/avatars/trang.jpg',
        profileImgs: [],
        description: 'Sống hết mình với đam mê.',
        gender: 'female',
        preference: {
          gender: 'male',
          maxDistance: 30,
          minAge: 25,
          maxAge: 45
        },
        skippedUsers: []
      },
      // User nam (không nên match vì không đúng giới tính ưa thích)
      {
        name: 'Nguyễn Văn Tuấn',
        email: 'tuannguyen@gmail.com',
        password: hashedPassword,
        birthday: new Date('2001-09-15'), // 24 tuổi
        location: {
          type: 'Point',
          coordinates: generateRandomCoordinates(hanoi, 8) // 8km
        },
        hobbies: ['chơi game', 'du lịch', 'đọc sách'],
        avatar: 'https://example.com/avatars/tuan.jpg',
        profileImgs: [],
        description: 'Thích cuộc sống năng động.',
        gender: 'male',
        preference: {
          gender: 'female',
          maxDistance: 35,
          minAge: 20,
          maxAge: 30
        },
        skippedUsers: []
      },
      // User nữ nhưng đã bị skip (nên được loại trừ)
      {
        name: 'Đỗ Thị Thanh',
        email: 'thanhdo@gmail.com',
        password: hashedPassword,
        birthday: new Date('2003-12-22'), // 22 tuổi
        location: {
          type: 'Point',
          coordinates: generateRandomCoordinates(hanoi, 12) // 12km
        },
        hobbies: ['đọc sách', 'du lịch'],
        avatar: 'https://example.com/avatars/thanh.jpg',
        profileImgs: [],
        description: 'Sống chậm và yêu đời.',
        gender: 'female',
        preference: {
          gender: 'male',
          maxDistance: 25,
          minAge: 20,
          maxAge: 35
        },
        skippedUsers: []
      },
      // User khác để test
      {
        name: 'Cupid Arrow',
        email: 'cupidarrow@gmail.com',
        password: hashedPassword,
        birthday: new Date('2004-08-22'), // 21 tuổi
        location: {
          type: 'Point',
          coordinates: generateRandomCoordinates(hanoi, 6) // 6km
        },
        hobbies: ['nấu ăn', 'yoga', 'xem phim'],
        avatar: 'https://example.com/avatars/cupid.jpg',
        profileImgs: [],
        description: 'Yêu thiên nhiên và động vật.',
        gender: 'female',
        preference: {
          gender: 'male',
          maxDistance: 25,
          minAge: 22,
          maxAge: 35
        },
        skippedUsers: []
      },
      {
        name: 'Ngô Văn Danh',
        email: 'zzdanhdz@gmail.com',
        password: hashedPassword,
        birthday: new Date('2004-10-22'), // 21 tuổi
        location: {
          type: 'Point',
          coordinates: generateRandomCoordinates(hanoi, 9) // 9km
        },
        hobbies: ['đá bóng', 'xem phim'],
        avatar: 'https://example.com/avatars/danh.jpg',
        profileImgs: [],
        description: 'Yêu thiên nhiên và động vật.',
        gender: 'male',
        preference: {
          gender: 'female',
          maxDistance: 25,
          minAge: 22,
          maxAge: 35
        },
        skippedUsers: []
      },
      
      // Thêm 25 users mới tại Đà Nẵng
      // User chính tại Đà Nẵng
      {
        name: 'Trần Minh Khoa',
        email: 'khoatran@gmail.com',
        password: hashedPassword,
        birthday: new Date('2000-07-15'), // 25 tuổi
        location: {
          type: 'Point',
          coordinates: danang // Trung tâm Đà Nẵng
        },
        hobbies: ['du lịch', 'lập trình', 'đi biển'],
        avatar: 'https://example.com/avatars/khoa.jpg',
        profileImgs: ['https://example.com/profiles/khoa1.jpg', 'https://example.com/profiles/khoa2.jpg'],
        description: 'Developer sống và làm việc tại Đà Nẵng, yêu thích không gian biển và núi.',
        gender: 'male',
        preference: {
          gender: 'female',
          maxDistance: 25,
          minAge: 20,
          maxAge: 30
        },
        skippedUsers: []
      },
      // Các users nữ ở Đà Nẵng
      {
        name: 'Lê Thị Thanh Hà',
        email: 'hale@gmail.com',
        password: hashedPassword,
        birthday: new Date('2002-03-10'), // 23 tuổi
        location: {
          type: 'Point',
          coordinates: danangAreas.haiChau // Quận Hải Châu
        },
        hobbies: ['yoga', 'ẩm thực', 'đọc sách'],
        avatar: 'https://example.com/avatars/hale.jpg',
        profileImgs: ['https://example.com/profiles/hale1.jpg'],
        description: 'Làm việc trong ngành du lịch, yêu thích khám phá ẩm thực địa phương.',
        gender: 'female',
        preference: {
          gender: 'male',
          maxDistance: 20,
          minAge: 23,
          maxAge: 33
        },
        skippedUsers: []
      },
      {
        name: 'Nguyễn Thị Hoài An',
        email: 'annguyen@gmail.com',
        password: hashedPassword,
        birthday: new Date('2003-09-22'), // 22 tuổi
        location: {
          type: 'Point',
          coordinates: danangAreas.sonTra // Quận Sơn Trà
        },
        hobbies: ['chụp ảnh', 'leo núi', 'cà phê'],
        avatar: 'https://example.com/avatars/an.jpg',
        profileImgs: ['https://example.com/profiles/an1.jpg', 'https://example.com/profiles/an2.jpg'],
        description: 'Photographer yêu biển Đà Nẵng.',
        gender: 'female',
        preference: {
          gender: 'male',
          maxDistance: 15,
          minAge: 22,
          maxAge: 32
        },
        skippedUsers: []
      },
      {
        name: 'Phạm Thị Mỹ Linh',
        email: 'linhpham@gmail.com',
        password: hashedPassword,
        birthday: new Date('2001-11-05'), // 24 tuổi
        location: {
          type: 'Point',
          coordinates: danangAreas.myKhe // Bãi biển Mỹ Khê
        },
        hobbies: ['bơi lội', 'du lịch', 'nấu ăn'],
        avatar: 'https://example.com/avatars/linh.jpg',
        profileImgs: ['https://example.com/profiles/linh1.jpg'],
        description: 'HLV bơi lội, yêu biển và nắng.',
        gender: 'female',
        preference: {
          gender: 'any',
          maxDistance: 25,
          minAge: 24,
          maxAge: 35
        },
        skippedUsers: []
      },
      {
        name: 'Trần Thị Minh Ngọc',
        email: 'ngoctran@gmail.com',
        password: hashedPassword,
        birthday: new Date('2004-04-18'), // 21 tuổi
        location: {
          type: 'Point',
          coordinates: danangAreas.camLe // Quận Cẩm Lệ
        },
        hobbies: ['đàn piano', 'đọc sách', 'thời trang'],
        avatar: 'https://example.com/avatars/ngoc.jpg',
        profileImgs: ['https://example.com/profiles/ngoc1.jpg'],
        description: 'Sinh viên năm 3 Đại học Đà Nẵng, chuyên ngành âm nhạc.',
        gender: 'female',
        preference: {
          gender: 'male',
          maxDistance: 20,
          minAge: 21,
          maxAge: 28
        },
        skippedUsers: []
      },
      {
        name: 'Võ Thị Quỳnh Anh',
        email: 'anhvo@gmail.com',
        password: hashedPassword,
        birthday: new Date('2002-12-24'), // 23 tuổi
        location: {
          type: 'Point',
          coordinates: danangAreas.thanhKhe // Quận Thanh Khê
        },
        hobbies: ['vẽ tranh', 'handmade', 'đi bộ'],
        avatar: 'https://example.com/avatars/anh.jpg',
        profileImgs: ['https://example.com/profiles/anh1.jpg', 'https://example.com/profiles/anh2.jpg'],
        description: 'Hoạ sĩ tự do, thích làm những món đồ handmade.',
        gender: 'female',
        preference: {
          gender: 'male',
          maxDistance: 15,
          minAge: 23,
          maxAge: 33
        },
        skippedUsers: []
      },
      {
        name: 'Nguyễn Thị Thanh Thảo',
        email: 'thaonguyen@gmail.com',
        password: hashedPassword,
        birthday: new Date('2003-02-14'), // 22 tuổi
        location: {
          type: 'Point',
          coordinates: danangAreas.lieuChieu // Quận Liên Chiểu
        },
        hobbies: ['đọc sách', 'du lịch', 'nấu ăn'],
        avatar: 'https://example.com/avatars/thao.jpg',
        profileImgs: ['https://example.com/profiles/thao1.jpg'],
        description: 'Sinh viên IT, thích khám phá công nghệ mới.',
        gender: 'female',
        preference: {
          gender: 'male',
          maxDistance: 20,
          minAge: 22,
          maxAge: 30
        },
        skippedUsers: []
      },
      {
        name: 'Huỳnh Thị Bích Trâm',
        email: 'tramhuynh@gmail.com',
        password: hashedPassword,
        birthday: new Date('2000-10-08'), // 25 tuổi
        location: {
          type: 'Point',
          coordinates: danangAreas.nguHanhSon // Quận Ngũ Hành Sơn
        },
        hobbies: ['yoga', 'thiền', 'nấu ăn chay'],
        avatar: 'https://example.com/avatars/tram.jpg',
        profileImgs: ['https://example.com/profiles/tram1.jpg', 'https://example.com/profiles/tram2.jpg'],
        description: 'Hướng dẫn viên yoga, sống healthy và tối giản.',
        gender: 'female',
        preference: {
          gender: 'male',
          maxDistance: 25,
          minAge: 25,
          maxAge: 40
        },
        skippedUsers: []
      },
      {
        name: 'Mai Thị Hoàng Yến',
        email: 'yenmai@gmail.com',
        password: hashedPassword,
        birthday: new Date('2001-05-20'), // 24 tuổi
        location: {
          type: 'Point',
          coordinates: danangAreas.hoianNearby // Gần Hội An
        },
        hobbies: ['chụp ảnh', 'du lịch', 'làm đẹp'],
        avatar: 'https://example.com/avatars/yen.jpg',
        profileImgs: ['https://example.com/profiles/yen1.jpg'],
        description: 'Travel blogger, thường xuyên di chuyển giữa Đà Nẵng và Hội An.',
        gender: 'female',
        preference: {
          gender: 'male',
          maxDistance: 30,
          minAge: 24,
          maxAge: 35
        },
        skippedUsers: []
      },
      {
        name: 'Đặng Thị Thu Hương',
        email: 'huongdang@gmail.com',
        password: hashedPassword,
        birthday: new Date('2003-07-12'), // 22 tuổi
        location: {
          type: 'Point',
          coordinates: danangAreas.hoaVang // Huyện Hòa Vang
        },
        hobbies: ['đọc sách', 'làm vườn', 'nấu ăn'],
        avatar: 'https://example.com/avatars/huongdang.jpg',
        profileImgs: ['https://example.com/profiles/huongdang1.jpg'],
        description: 'Giáo viên tiểu học, yêu thiên nhiên và trẻ em.',
        gender: 'female',
        preference: {
          gender: 'male',
          maxDistance: 25,
          minAge: 22,
          maxAge: 32
        },
        skippedUsers: []
      },
      // Các users nam ở Đà Nẵng
      {
        name: 'Lê Minh Tuấn',
        email: 'tuanle@gmail.com',
        password: hashedPassword,
        birthday: new Date('1999-12-10'), // 26 tuổi
        location: {
          type: 'Point',
          coordinates: danangAreas.haiChau // Quận Hải Châu
        },
        hobbies: ['lập trình', 'chơi guitar', 'du lịch'],
        avatar: 'https://example.com/avatars/tuanle.jpg',
        profileImgs: ['https://example.com/profiles/tuanle1.jpg', 'https://example.com/profiles/tuanle2.jpg'],
        description: 'Senior developer tại một công ty phần mềm ở Đà Nẵng.',
        gender: 'male',
        preference: {
          gender: 'female',
          maxDistance: 20,
          minAge: 22,
          maxAge: 30
        },
        skippedUsers: []
      },
      {
        name: 'Nguyễn Quang Huy',
        email: 'huynguyen@gmail.com',
        password: hashedPassword,
        birthday: new Date('2002-03-25'), // 23 tuổi
        location: {
          type: 'Point',
          coordinates: danangAreas.thanhKhe // Quận Thanh Khê
        },
        hobbies: ['thể thao', 'bóng rổ', 'du lịch'],
        avatar: 'https://example.com/avatars/huy.jpg',
        profileImgs: ['https://example.com/profiles/huy1.jpg'],
        description: 'HLV thể hình, đam mê bóng rổ và cuộc sống lành mạnh.',
        gender: 'male',
        preference: {
          gender: 'female',
          maxDistance: 15,
          minAge: 21,
          maxAge: 28
        },
        skippedUsers: []
      },
      {
        name: 'Trần Văn Nam',
        email: 'namtran@gmail.com',
        password: hashedPassword,
        birthday: new Date('2000-08-17'), // 25 tuổi
        location: {
          type: 'Point',
          coordinates: danangAreas.sonTra // Quận Sơn Trà
        },
        hobbies: ['lướt sóng', 'leo núi', 'chụp ảnh'],
        avatar: 'https://example.com/avatars/nam.jpg',
        profileImgs: ['https://example.com/profiles/nam1.jpg', 'https://example.com/profiles/nam2.jpg'],
        description: 'Hướng dẫn viên du lịch mạo hiểm tại Sơn Trà.',
        gender: 'male',
        preference: {
          gender: 'female',
          maxDistance: 25,
          minAge: 22,
          maxAge: 32
        },
        skippedUsers: []
      },
      {
        name: 'Phạm Đức Anh',
        email: 'anhpham@gmail.com',
        password: hashedPassword,
        birthday: new Date('2001-04-05'), // 24 tuổi
        location: {
          type: 'Point',
          coordinates: danangAreas.myKhe // Bãi biển Mỹ Khê
        },
        hobbies: ['bartender', 'du lịch', 'âm nhạc'],
        avatar: 'https://example.com/avatars/anhpham.jpg',
        profileImgs: ['https://example.com/profiles/anhpham1.jpg'],
        description: 'Bartender tại một resort ven biển, yêu âm nhạc và cocktail.',
        gender: 'male',
        preference: {
          gender: 'female',
          maxDistance: 20,
          minAge: 21,
          maxAge: 30
        },
        skippedUsers: []
      },
      {
        name: 'Huỳnh Công Thành',
        email: 'thanhhuynh@gmail.com',
        password: hashedPassword,
        birthday: new Date('1998-01-27'), // 27 tuổi
        location: {
          type: 'Point',
          coordinates: danangAreas.camLe // Quận Cẩm Lệ
        },
        hobbies: ['kinh doanh', 'đọc sách', 'thể thao'],
        avatar: 'https://example.com/avatars/thanh.jpg',
        profileImgs: ['https://example.com/profiles/thanh1.jpg', 'https://example.com/profiles/thanh2.jpg'],
        description: 'Chủ chuỗi quán cà phê tại Đà Nẵng, thích đọc sách về kinh doanh.',
        gender: 'male',
        preference: {
          gender: 'female',
          maxDistance: 25,
          minAge: 22,
          maxAge: 35
        },
        skippedUsers: []
      },
      {
        name: 'Bùi Minh Quân',
        email: 'quanbui@gmail.com',
        password: hashedPassword,
        birthday: new Date('2000-11-12'), // 25 tuổi
        location: {
          type: 'Point',
          coordinates: danangAreas.lieuChieu // Quận Liên Chiểu
        },
        hobbies: ['âm nhạc', 'chơi nhạc cụ', 'du lịch'],
        avatar: 'https://example.com/avatars/quan.jpg',
        profileImgs: ['https://example.com/profiles/quan1.jpg'],
        description: 'Nhạc sĩ tự do, biết chơi nhiều loại nhạc cụ.',
        gender: 'male',
        preference: {
          gender: 'female',
          maxDistance: 20,
          minAge: 21,
          maxAge: 28
        },
        skippedUsers: []
      },
      {
        name: 'Ngô Quang Minh',
        email: 'minhquang@gmail.com',
        password: hashedPassword,
        birthday: new Date('1996-09-08'), // 29 tuổi
        location: {
          type: 'Point',
          coordinates: danangAreas.nguHanhSon // Quận Ngũ Hành Sơn
        },
        hobbies: ['nhiếp ảnh', 'leo núi', 'thiền'],
        avatar: 'https://example.com/avatars/minh.jpg',
        profileImgs: ['https://example.com/profiles/minh1.jpg', 'https://example.com/profiles/minh2.jpg'],
        description: 'Nhiếp ảnh gia chuyên chụp phong cảnh Đà Nẵng - Hội An.',
        gender: 'male',
        preference: {
          gender: 'female',
          maxDistance: 30,
          minAge: 25,
          maxAge: 35
        },
        skippedUsers: []
      },
      {
        name: 'Đỗ Trung Kiên',
        email: 'kiendotb@gmail.com',
        password: hashedPassword,
        birthday: new Date('1997-03-15'), // 28 tuổi
        location: {
          type: 'Point',
          coordinates: danangAreas.baNa // Bà Nà Hills
        },
        hobbies: ['thể thao', 'leo núi', 'du lịch'],
        avatar: 'https://example.com/avatars/kien.jpg',
        profileImgs: ['https://example.com/profiles/kien1.jpg'],
        description: 'Làm việc tại khu du lịch Bà Nà Hills, thích hoạt động ngoài trời.',
        gender: 'male',
        preference: {
          gender: 'female',
          maxDistance: 35,
          minAge: 23,
          maxAge: 33
        },
        skippedUsers: []
      },
      {
        name: 'Vũ Đình Long',
        email: 'longvu@gmail.com',
        password: hashedPassword,
        birthday: new Date('1999-07-30'), // 26 tuổi
        location: {
          type: 'Point',
          coordinates: danangAreas.hoaVang // Huyện Hòa Vang
        },
        hobbies: ['nông nghiệp sạch', 'đọc sách', 'yoga'],
        avatar: 'https://example.com/avatars/long.jpg',
        profileImgs: ['https://example.com/profiles/long1.jpg', 'https://example.com/profiles/long2.jpg'],
        description: 'Chủ trang trại hữu cơ ở Hòa Vang, đam mê canh tác bền vững.',
        gender: 'male',
        preference: {
          gender: 'female',
          maxDistance: 30,
          minAge: 23,
          maxAge: 36
        },
        skippedUsers: []
      },
      // Thêm những người có sở thích và trải nghiệm đặc biệt
      {
        name: 'Hồ Thị Lan Anh',
        email: 'lananh@gmail.com',
        password: hashedPassword,
        birthday: new Date('2002-06-17'), // 23 tuổi
        location: {
          type: 'Point',
          coordinates: danangAreas.hoianNearby // Gần Hội An
        },
        hobbies: ['thiền', 'yoga', 'làm đồ thủ công'],
        avatar: 'https://example.com/avatars/lananh.jpg',
        profileImgs: ['https://example.com/profiles/lananh1.jpg'],
        description: 'Giáo viên yoga, chuyên về thiền và nghệ thuật sống chánh niệm.',
        gender: 'female',
        preference: {
          gender: 'any',
          maxDistance: 30,
          minAge: 25,
          maxAge: 45
        },
        skippedUsers: []
      },
      {
        name: 'Trương Minh Hoàng',
        email: 'hoangtruong@gmail.com',
        password: hashedPassword,
        birthday: new Date('1995-02-23'), // 30 tuổi
        location: {
          type: 'Point',
          coordinates: danangAreas.myKhe // Bãi biển Mỹ Khê
        },
        hobbies: ['lướt sóng', 'du lịch', 'ngoại ngữ'],
        avatar: 'https://example.com/avatars/hoang.jpg',
        profileImgs: ['https://example.com/profiles/hoang1.jpg', 'https://example.com/profiles/hoang2.jpg'],
        description: 'Surfer và là chủ một quán bar ven biển, nói được 5 thứ tiếng.',
        gender: 'male',
        preference: {
          gender: 'female',
          maxDistance: 25,
          minAge: 25,
          maxAge: 35
        },
        skippedUsers: []
      },
      {
        name: 'Lý Thu Trang',
        email: 'trangly@gmail.com',
        password: hashedPassword,
        birthday: new Date('2004-01-12'), // 21 tuổi
        location: {
          type: 'Point',
          coordinates: danangAreas.haiChau // Quận Hải Châu
        },
        hobbies: ['piano', 'vẽ', 'đọc sách'],
        avatar: 'https://example.com/avatars/trangly.jpg',
        profileImgs: ['https://example.com/profiles/trangly1.jpg'],
        description: 'Sinh viên Conservatory of Music, mê văn học cổ điển.',
        gender: 'female',
        preference: {
          gender: 'male',
          maxDistance: 15,
          minAge: 21,
          maxAge: 29
        },
        skippedUsers: []
      },
      {
        name: 'Võ Hoàng Phúc',
        email: 'phucvo@gmail.com',
        password: hashedPassword,
        birthday: new Date('1994-09-03'), // 31 tuổi
        location: {
          type: 'Point',
          coordinates: danangAreas.sonTra // Quận Sơn Trà
        },
        hobbies: ['trồng cây', 'bảo vệ môi trường', 'thiền'],
        avatar: 'https://example.com/avatars/phucvo.jpg',
        profileImgs: ['https://example.com/profiles/phucvo1.jpg', 'https://example.com/profiles/phucvo2.jpg'],
        description: 'Nhà hoạt động môi trường, sáng lập dự án tái chế tại Đà Nẵng.',
        gender: 'male',
        preference: {
          gender: 'female',
          maxDistance: 30,
          minAge: 25,
          maxAge: 40
        },
        skippedUsers: []
      },
      {
        name: 'Nguyễn Thị Kim Chi',
        email: 'kimchi@gmail.com',
        password: hashedPassword,
        birthday: new Date('2001-08-08'), // 24 tuổi
        location: {
          type: 'Point',
          coordinates: danangAreas.thanhKhe // Quận Thanh Khê
        },
        hobbies: ['nấu ăn', 'ẩm thực', 'du lịch'],
        avatar: 'https://example.com/avatars/kimchi.jpg',
        profileImgs: ['https://example.com/profiles/kimchi1.jpg'],
        description: 'Đầu bếp tại nhà hàng cao cấp, đam mê ẩm thực Việt Nam.',
        gender: 'female',
        preference: {
          gender: 'male',
          maxDistance: 20,
          minAge: 24,
          maxAge: 35
        },
        skippedUsers: []
      }
    ]
    
    const createdUsers = await User.insertMany(users)
    
    // Thêm user đã bị skip vào danh sách skip của user chính
    // Tìm user chính và Đỗ Thị Thanh
    const mainUser = createdUsers.find(u => u.email === 'nguyenhuuphuc@gmail.com')
    const skippedUser = createdUsers.find(u => u.email === 'thanhdo@gmail.com')
    
    // Cập nhật skippedUsers của main user
    if (mainUser && skippedUser) {
      await User.updateOne(
        { _id: mainUser._id },
        { $push: { skippedUsers: skippedUser._id } }
      )
    }
    
    console.log('Users seeded successfully')
    return createdUsers
  } catch (error) {
    console.error('User seeding failed:', error)
    throw error
  }
}

async function seedPosts(users) {
  try {
    console.log('Seeding posts...')
    
    await Post.deleteMany({})
    
    const mainUser = users.find(u => u.email === 'nguyenhuuphuc@gmail.com')
    const user2 = users.find(u => u.email === 'mainguyen@gmail.com')
    const user3 = users.find(u => u.email === 'zzdanhdz@gmail.com')
    
    // Tìm users mới từ Đà Nẵng
    const danangMainUser = users.find(u => u.email === 'khoatran@gmail.com')
    const danangFemale1 = users.find(u => u.email === 'hale@gmail.com')
    const danangFemale2 = users.find(u => u.email === 'annguyen@gmail.com')
    const danangMale1 = users.find(u => u.email === 'tuanle@gmail.com')
    const danangMale2 = users.find(u => u.email === 'namtran@gmail.com')
    
    const posts = [
      {
        title: 'Chuyến du lịch Đà Lạt',
        user_id: mainUser._id,
        images: ['https://example.com/posts/dalat1.jpg', 'https://example.com/posts/dalat2.jpg'],
        reactions: [user2._id]
      },
      {
        title: 'Món ăn ngon cuối tuần',
        user_id: user2._id,
        images: ['https://example.com/posts/food1.jpg'],
        reactions: [mainUser._id, user3._id]
      },
      {
        title: 'Buổi tối ở Sài Gòn',
        user_id: user3._id,
        images: ['https://example.com/posts/saigon1.jpg', 'https://example.com/posts/saigon2.jpg'],
        reactions: [user2._id]
      },
      {
        title: 'Review sách mới',
        user_id: mainUser._id,
        images: ['https://example.com/posts/book1.jpg'],
        reactions: []
      },
      {
        title: 'Tips học lập trình',
        user_id: mainUser._id,
        images: [],
        reactions: [user2._id, user3._id]
      },
      // Thêm posts cho người dùng Đà Nẵng
      {
        title: 'Hoàng hôn tại Bãi biển Mỹ Khê',
        user_id: danangMainUser._id,
        images: ['https://example.com/posts/mykhesunset1.jpg', 'https://example.com/posts/mykhesunset2.jpg'],
        reactions: [danangFemale1._id, danangFemale2._id, danangMale1._id]
      },
      {
        title: 'Cafe view đẹp ở Đà Nẵng',
        user_id: danangFemale1._id,
        images: ['https://example.com/posts/danangcafe1.jpg'],
        reactions: [danangMainUser._id, danangMale2._id]
      },
      {
        title: 'Tour khám phá Sơn Trà',
        user_id: danangMale2._id,
        images: ['https://example.com/posts/sontra1.jpg', 'https://example.com/posts/sontra2.jpg'],
        reactions: [danangFemale1._id, danangFemale2._id]
      },
      {
        title: 'Món ngon Đà Nẵng phải thử',
        user_id: danangFemale2._id,
        images: ['https://example.com/posts/danangfood1.jpg', 'https://example.com/posts/danangfood2.jpg'],
        reactions: [danangMainUser._id, danangMale1._id]
      },
      {
        title: 'Lập trình viên Đà Nẵng 2024',
        user_id: danangMale1._id,
        images: ['https://example.com/posts/danangdev1.jpg'],
        reactions: [danangMainUser._id]
      }
    ]
    
    await Post.insertMany(posts)
    
    console.log('Posts seeded successfully')
    return await Post.find()
  } catch (error) {
    console.error('Post seeding failed:', error)
    throw error
  }
}

async function seedConversations(users) {
  try {
    console.log('Seeding conversations...')
    
    await Conversation.deleteMany({})
    
    const mainUser = users.find(u => u.email === 'nguyenhuuphuc@gmail.com')
    const user2 = users.find(u => u.email === 'mainguyen@gmail.com')
    const user3 = users.find(u => u.email === 'hatran@gmail.com')
    const user4 = users.find(u => u.email === 'zzdanhdz@gmail.com')
    
    // Tìm users mới từ Đà Nẵng
    const danangMainUser = users.find(u => u.email === 'khoatran@gmail.com')
    const danangFemale1 = users.find(u => u.email === 'hale@gmail.com')
    const danangFemale2 = users.find(u => u.email === 'annguyen@gmail.com')
    const danangMale1 = users.find(u => u.email === 'tuanle@gmail.com')
    
    const conversations = [
      {
        sender: mainUser._id,
        receiver: user2._id,
        status: 'active',
        last_message: 'Em ăn cơm chưa?'
      },
      {
        sender: mainUser._id,
        receiver: user3._id,
        status: 'active',
        last_message: 'Cuối tuần này đi cà phê nhé!'
      },
      {
        sender: user3._id,
        receiver: user4._id,
        status: 'active',
        last_message: 'Chào bạn, rất vui được làm quen.'
      },
      // Thêm conversations cho người dùng Đà Nẵng
      {
        sender: danangMainUser._id,
        receiver: danangFemale1._id,
        status: 'active',
        last_message: 'Ở Đà Nẵng bạn hay đi cafe ở đâu?'
      },
      {
        sender: danangMainUser._id,
        receiver: danangFemale2._id,
        status: 'active',
        last_message: 'Cuối tuần này mình đi Sơn Trà nhé!'
      },
      {
        sender: danangMale1._id,
        receiver: danangFemale1._id,
        status: 'active',
        last_message: 'Workshop tuần sau bạn có tham gia không?'
      }
    ]
    
    await Conversation.insertMany(conversations)
    
    console.log('Conversations seeded successfully')
    return await Conversation.find()
  } catch (error) {
    console.error('Conversation seeding failed:', error)
    throw error
  }
}

async function seedMessages(users, conversations) {
  try {
    console.log('Seeding messages...')
    
    await Message.deleteMany({})
    
    const mainUser = users.find(u => u.email === 'nguyenhuuphuc@gmail.com')
    const user2 = users.find(u => u.email === 'mainguyen@gmail.com')
    const conversation1 = conversations[0]
    
    // Tìm users và conversations của Đà Nẵng
    const danangMainUser = users.find(u => u.email === 'khoatran@gmail.com')
    const danangFemale1 = users.find(u => u.email === 'hale@gmail.com')
    const danangConversation = conversations.find(
      c => c.sender.toString() === danangMainUser._id.toString() && 
          c.receiver.toString() === danangFemale1._id.toString()
    )
    
    const messages = [
      {
        conversation: conversation1._id,
        sender: mainUser._id,
        content: 'Hello em!',
        status: 'read'
      },
      {
        conversation: conversation1._id,
        sender: user2._id,
        content: 'Hi anh!',
        status: 'read'
      },
      {
        conversation: conversation1._id,
        sender: mainUser._id,
        content: 'Anh rất vui được làm quen với em.',
        status: 'read'
      },
      {
        conversation: conversation1._id,
        sender: user2._id,
        content: 'Em cũng vậy.',
        status: 'read'
      },
      {
        conversation: conversation1._id,
        sender: mainUser._id,
        content: 'Em ăn cơm chưa?',
        status: 'delivered'
      },
      // Add more messages to other conversations
      {
        conversation: conversations[1]._id,
        sender: mainUser._id,
        content: 'Chào bạn!',
        status: 'read'
      },
      {
        conversation: conversations[1]._id,
        sender: users.find(u => u.email === 'hatran@gmail.com')._id,
        content: 'Chào bạn, rất vui được làm quen.',
        status: 'read'
      },
      {
        conversation: conversations[1]._id,
        sender: mainUser._id,
        content: 'Cuối tuần này đi cà phê nhé!',
        status: 'delivered'
      },
      // Thêm tin nhắn cho người dùng Đà Nẵng
      {
        conversation: danangConversation._id,
        sender: danangMainUser._id,
        content: 'Chào bạn, mình là Khoa!',
        status: 'read'
      },
      {
        conversation: danangConversation._id,
        sender: danangFemale1._id,
        content: 'Chào Khoa, rất vui được làm quen!',
        status: 'read'
      },
      {
        conversation: danangConversation._id,
        sender: danangMainUser._id,
        content: 'Bạn sống ở Đà Nẵng lâu chưa?',
        status: 'read'
      },
      {
        conversation: danangConversation._id,
        sender: danangFemale1._id,
        content: 'Mình đã ở đây được 5 năm rồi. Còn bạn?',
        status: 'read'
      },
      {
        conversation: danangConversation._id,
        sender: danangMainUser._id,
        content: 'Mình mới chuyển đến đây 2 năm thôi. Ở Đà Nẵng bạn hay đi cafe ở đâu?',
        status: 'delivered'
      }
    ]
    
    await Message.insertMany(messages)
    
    console.log('Messages seeded successfully')
    return await Message.find()
  } catch (error) {
    console.error('Message seeding failed:', error)
    throw error
  }
}

async function seedNotifications(users, conversations, posts) {
  try {
    console.log('Seeding notifications...')
    
    await Notification.deleteMany({})
    
    const mainUser = users.find(u => u.email === 'nguyenhuuphuc@gmail.com')
    const user2 = users.find(u => u.email === 'mainguyen@gmail.com')
    
    // Tìm users và posts của Đà Nẵng
    const danangMainUser = users.find(u => u.email === 'khoatran@gmail.com')
    const danangFemale1 = users.find(u => u.email === 'hale@gmail.com')
    const danangPost = posts.find(p => p.user_id.toString() === danangMainUser._id.toString())
    
    const notifications = [
      {
        content: 'Bạn có tin nhắn mới từ Mai Nguyễn',
        id_conversation: conversations[0]._id,
        id_user: mainUser._id.toString(),
        is_read: false
      },
      {
        content: 'Mai Nguyễn đã thích bài viết của bạn',
        id_post: posts[0]._id,
        id_user: mainUser._id.toString(),
        is_read: true
      },
      {
        content: 'Bạn có lời mời kết bạn mới',
        id_user: mainUser._id.toString(),
        is_read: false
      },
      {
        content: 'Phúc Nguyễn đã thích bài viết của bạn',
        id_post: posts[1]._id,
        id_user: user2._id.toString(),
        is_read: false
      },
      // Thêm thông báo cho người dùng Đà Nẵng
      {
        content: 'Bạn có tin nhắn mới từ Thanh Hà',
        id_conversation: conversations.find(c => 
          c.sender.toString() === danangMainUser._id.toString() && 
          c.receiver.toString() === danangFemale1._id.toString()
        )._id,
        id_user: danangMainUser._id.toString(),
        is_read: false
      },
      {
        content: 'Thanh Hà đã thích bài viết của bạn',
        id_post: danangPost._id,
        id_user: danangMainUser._id.toString(),
        is_read: true
      },
      {
        content: 'Bạn có match mới',
        id_user: danangMainUser._id.toString(),
        is_read: false
      },
      {
        content: 'Minh Khoa đã thích bài viết của bạn',
        id_post: posts.find(p => p.user_id.toString() === danangFemale1._id.toString())._id,
        id_user: danangFemale1._id.toString(),
        is_read: false
      }
    ]
    
    await Notification.insertMany(notifications)
    
    console.log('Notifications seeded successfully')
    return await Notification.find()
  } catch (error) {
    console.error('Notification seeding failed:', error)
    throw error
  }
}

async function seedAll() {
  try {
    console.log('Running all seeders...')
    const users = await seedUsers()
    const posts = await seedPosts(users)
    const conversations = await seedConversations(users)
    const messages = await seedMessages(users, conversations)
    const notifications = await seedNotifications(users, conversations, posts)
    
    console.log('All data seeded successfully')
    console.log(`
    Summary:
    - Users: ${users.length}
    - Posts: ${posts.length}
    - Conversations: ${conversations.length}
    - Messages: ${messages.length}
    - Notifications: ${notifications.length}
    `)
    return true
  } catch (error) {
    console.error('Seeding failed:', error)
    return false
  }
}

module.exports = {
  seedAll,
  calculateDistance
}