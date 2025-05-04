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

// Helper function to generate 5 random profile image URLs
function generateRandomProfileImages() {
  const profileImgs = [];
  for (let i = 0; i < 5; i++) {
    const randomId = Math.floor(Math.random() * 200) + 1;
    profileImgs.push(`https://picsum.photos/id/${randomId}/200/300`);
  }
  return profileImgs;
}

// Define standardized hobbies list
const hobbiesList = [
  { id: 1, name: "Photography", icon: "camera" },
  { id: 2, name: "Shopping", icon: "shopping-bag" },
  { id: 3, name: "Karaoke", icon: "microphone" },
  { id: 4, name: "Yoga", icon: "yin-yang" },
  { id: 5, name: "Cooking", icon: "utensils" },
  { id: 6, name: "Tennis", icon: "table-tennis" },
  { id: 7, name: "Run", icon: "running" },
  { id: 8, name: "Swimming", icon: "swimmer" },
  { id: 9, name: "Art", icon: "palette" },
  { id: 10, name: "Traveling", icon: "plane" },
  { id: 11, name: "Extreme", icon: "bolt" },
  { id: 12, name: "Music", icon: "music" },
  { id: 13, name: "Drink", icon: "wine-glass" },
  { id: 14, name: "Games", icon: "gamepad" },
];

// Function to get random hobbies from the hobbies list with required hobbies
function getRandomHobbies(count = 3) {
  // Find the yoga and run entries
  const yogaEntry = hobbiesList.find(hobby => hobby.name === "Yoga");
  const runEntry = hobbiesList.find(hobby => hobby.name === "Run");
  
  // Create a filtered list without the required hobbies
  const filteredList = hobbiesList.filter(hobby => 
    hobby.name !== "Yoga" && hobby.name !== "Run"
  );
  
  // Shuffle the filtered list
  const shuffled = [...filteredList].sort(() => 0.5 - Math.random());
  
  // Take random hobbies from the shuffled list (count - 2 to account for yoga and run)
  const randomHobbies = shuffled.slice(0, count - 2);
  
  // Add the required hobbies
  if (yogaEntry) randomHobbies.push(yogaEntry);
  if (runEntry) randomHobbies.push(runEntry);
  
  // Return just the hobby names
  return randomHobbies.map(hobby => hobby.name);
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
          coordinates: danang
        },
        hobbies: getRandomHobbies(10),
        avatar: 'https://i.pinimg.com/736x/fb/a2/86/fba28680f1795185ff3e1d4e3b181701.jpg',
        profileImgs: generateRandomProfileImages(),
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
          coordinates: generateRandomCoordinates(danang, 5) // 5km
        },
        hobbies: getRandomHobbies(10),
        avatar: 'https://i.pinimg.com/736x/3b/e2/a0/3be2a067cb354015aa33a929d3049b39.jpg',
        profileImgs: generateRandomProfileImages(),
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
          coordinates: generateRandomCoordinates(danang, 10) // 10km
        },
        hobbies: getRandomHobbies(10),
        avatar: 'https://i.pinimg.com/736x/33/33/43/3333433e712f28c122bd8e9cde8e1eac.jpg',
        profileImgs: generateRandomProfileImages(),
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
          coordinates: generateRandomCoordinates(danang, 20) // 20km
        },
        hobbies: getRandomHobbies(10),
        avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQy5tb0USHvG9tP540twLwKgiOjkk6gVcmRNg&s',
        profileImgs: generateRandomProfileImages(),
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
          coordinates: generateRandomCoordinates(danang, 45) // 45km - quá xa
        },
        hobbies: getRandomHobbies(10),
        avatar: 'https://i.pinimg.com/736x/52/32/22/52322276e1ca4256de03567167dd5947.jpg',
        profileImgs: generateRandomProfileImages(),
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
          coordinates: generateRandomCoordinates(danang, 15) // 15km
        },
        hobbies: getRandomHobbies(10),
        avatar: 'https://i.pinimg.com/736x/c5/52/53/c55253def93a88ec4afaa3d405023b18.jpg',
        profileImgs: generateRandomProfileImages(),
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
          coordinates: generateRandomCoordinates(danang, 8) // 8km
        },
        hobbies: getRandomHobbies(10),
        avatar: 'https://i.pinimg.com/originals/8d/e5/9e/8de59ea875845377d90e944bb6ed3e8f.jpg',
        profileImgs: generateRandomProfileImages(),
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
          coordinates: generateRandomCoordinates(danang, 12) // 12km
        },
        hobbies: getRandomHobbies(10),
        avatar: 'https://preview.redd.it/qc9kjus5fkt91.png?width=640&crop=smart&auto=webp&s=7222dcbe44c4a9d46e5484bac7aab86412587b65',
        profileImgs: generateRandomProfileImages(),
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
          coordinates: generateRandomCoordinates(danang, 6) // 6km
        },
        hobbies: getRandomHobbies(10),
        avatar: 'https://media.istockphoto.com/id/492529287/photo/portrait-of-happy-laughing-man.jpg?s=612x612&w=0&k=20&c=0xQcd69Bf-mWoJYgjxBSPg7FHS57nOfYpZaZlYDVKRE=',
        profileImgs: generateRandomProfileImages(),
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
          coordinates: generateRandomCoordinates(danang, 9) // 9km
        },
        hobbies: getRandomHobbies(10),
        avatar: 'https://i.pinimg.com/736x/65/97/10/659710b41dc0cc7e79d681ea26fab1d3.jpg',
        profileImgs: generateRandomProfileImages(),
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
        hobbies: getRandomHobbies(10),
        avatar: 'https://plus.unsplash.com/premium_photo-1682092603230-1ce7cf8ca451?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW5kaWFuJTIwbWFufGVufDB8fDB8fHww',
        profileImgs: generateRandomProfileImages(),
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
        hobbies: getRandomHobbies(10),
        avatar: 'https://i.pinimg.com/736x/b6/26/c3/b626c36976ac71db521b357a0ae7d3c3.jpg',
        profileImgs: generateRandomProfileImages(),
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
        hobbies: getRandomHobbies(10),
        avatar: 'https://i.pinimg.com/736x/1e/b4/d1/1eb4d1008df88ce115657179af8517cb.jpg',
        profileImgs: generateRandomProfileImages(),
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
        hobbies: getRandomHobbies(10),
        avatar: 'https://i.pinimg.com/736x/a0/ab/95/a0ab95858cf5de2634e369585c244125.jpg',
        profileImgs: generateRandomProfileImages(),
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
        hobbies: getRandomHobbies(10),
        avatar: 'https://i.pinimg.com/736x/79/3e/e4/793ee4f548bd4dfc23232ae7df755c70.jpg',
        profileImgs: generateRandomProfileImages(),
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
        hobbies: getRandomHobbies(10),
        avatar: 'https://i.pinimg.com/736x/fd/04/1f/fd041fae95a68a324ff69888e9c75566.jpg',
        profileImgs: generateRandomProfileImages(),
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
        hobbies: getRandomHobbies(10),
        avatar: 'https://i.pinimg.com/736x/25/b4/bf/25b4bff47fc3911d58592232b3ff5361.jpg',
        profileImgs: generateRandomProfileImages(),
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
        hobbies: getRandomHobbies(10),
        avatar: 'https://i.pinimg.com/474x/5b/54/56/5b54567f379eeb5d2a0ccbe89ba37507.jpg',
        profileImgs: generateRandomProfileImages(),
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
        hobbies: getRandomHobbies(10),
        avatar: 'https://i.pinimg.com/236x/71/a1/48/71a14843f169a25b0d19e05bc6b1fc19.jpg',
        profileImgs: generateRandomProfileImages(),
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
        hobbies: getRandomHobbies(10),
        avatar: 'https://i.pinimg.com/736x/59/9f/33/599f333c60b67be1564c9f6cf360cbe7.jpg',
        profileImgs: generateRandomProfileImages(),
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
        hobbies: getRandomHobbies(10),
        avatar: 'https://kenh14cdn.com/203336854389633024/2021/6/19/photo-1-1624085688954722666788.jpg',
        profileImgs: generateRandomProfileImages(),
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
        hobbies: getRandomHobbies(10),
        avatar: 'https://www.unhcr.ca/wp-content/uploads/2016/08/16-08-01-UNHCR-Zsolt-Balla-Afghan-unaccompanied-child-refugee-Hungary.jpg',
        profileImgs: generateRandomProfileImages(),
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
        hobbies: getRandomHobbies(10),
        avatar: 'https://preview.redd.it/eavxzvh6pfo91.jpg?width=640&crop=smart&auto=webp&s=858545d9eb2eed51c13088e6401e6e60d3989dd6',
        profileImgs: generateRandomProfileImages(),
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
        hobbies: getRandomHobbies(10),
        avatar: 'https://example.com/avatars/anhpham.jpg',
        profileImgs: generateRandomProfileImages(),
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
        hobbies: getRandomHobbies(10),
        avatar: 'https://i.pinimg.com/736x/6b/f8/00/6bf80038fb91f76d186ca9be599f5d6f.jpg',
        profileImgs: generateRandomProfileImages(),
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
        hobbies: getRandomHobbies(10),
        avatar: 'https://img.freepik.com/free-photo/front-view-smiley-man-seaside_23-2149737022.jpg?semt=ais_hybrid&w=740',
        profileImgs: generateRandomProfileImages(),
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
        hobbies: getRandomHobbies(10),
        avatar: 'https://i.pinimg.com/originals/e2/4c/6f/e24c6f5d9079f94038038de0bc11ea2f.jpg',
        profileImgs: generateRandomProfileImages(),
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
        hobbies: getRandomHobbies(10),
        avatar: 'https://i.pinimg.com/736x/5a/fe/a2/5afea2d3fffaf782c09e2d0cd1c306e8.jpg',
        profileImgs: generateRandomProfileImages(),
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
        hobbies: getRandomHobbies(10),
        avatar: 'https://i.pinimg.com/originals/29/83/92/2983929ccf0d2dd8b9ef6fca31017b07.jpg',
        profileImgs: generateRandomProfileImages(),
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
        hobbies: getRandomHobbies(10),
        avatar: 'https://i.pinimg.com/736x/60/42/87/6042872a88bdc12304e97f851ce046ed.jpg',
        profileImgs: generateRandomProfileImages(),
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
        hobbies: getRandomHobbies(10),
        avatar: 'https://i.pinimg.com/474x/92/1b/51/921b51f07bcdd183a09d5f996f7a0b91.jpg',
        profileImgs: generateRandomProfileImages(),
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
        hobbies: getRandomHobbies(10),
        avatar: 'https://i.pinimg.com/736x/37/43/b3/3743b3745033c4b0227c27d1e0c452f0.jpg',
        profileImgs: generateRandomProfileImages(),
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
        hobbies: getRandomHobbies(10),
        avatar: 'https://i.pinimg.com/736x/c0/70/7c/c0707c2f583cb190c41327b544f0a1bf.jpg',
        profileImgs: generateRandomProfileImages(),
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
        hobbies: getRandomHobbies(10),
        avatar: 'https://i.pinimg.com/736x/55/50/7b/55507b1804e448d61231141a9c3a40c7.jpg',
        profileImgs: generateRandomProfileImages(),
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