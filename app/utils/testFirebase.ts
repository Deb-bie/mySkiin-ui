// import { 
//   createPost, 
//   getPosts, 
//   createUser, 
//   getUsers, 
//   getDashboardStats,
//   seedInitialData 
// } from '../lib/firebase/services'

// export async function testFirebaseConnection() {
//   console.log('🔥 Testing Firebase Connection...')
  
//   try {
//     // Test 1: Seed Initial Data
//     console.log('\n1️⃣ Seeding initial data...')
//     await seedInitialData()
//     console.log('✅ Initial data seeded successfully!')
    
//     // Test 2: Get Users
//     console.log('\n2️⃣ Fetching users...')
//     const users = await getUsers()
//     console.log(`✅ Found ${users.length} users:`, users)
    
//     // Test 3: Get Posts
//     console.log('\n3️⃣ Fetching posts...')
//     const posts = await getPosts()
//     console.log(`✅ Found ${posts.length} posts:`, posts)
    
//     // Test 4: Get Dashboard Stats
//     console.log('\n4️⃣ Calculating dashboard stats...')
//     const stats = await getDashboardStats()
//     console.log('✅ Dashboard stats:', stats)
    
//     // Test 5: Create Test Post
//     console.log('\n5️⃣ Creating test post...')
//     const testPostId = await createPost({
//       title: 'Test Post from Firebase',
//       content: 'This post was created to test Firebase integration!',
//       author: 'Test Admin',
//       status: 'published',
//       views: 0,
//       date: new Date().toISOString().split('T')[0]
//     })
//     console.log(`✅ Test post created with ID: ${testPostId}`)
    
//     console.log('\n🎉 All Firebase tests passed!')
//     return true
    
//   } catch (error) {
//     console.error('❌ Firebase test failed:', error)
//     return false
//   }
// }