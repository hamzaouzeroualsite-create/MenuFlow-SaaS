import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { setGlobalOptions } from 'firebase-functions/v2';

setGlobalOptions({ maxInstances: 10, region: 'europe-west1' });

admin.initializeApp();
const db = admin.firestore();

async function verifySuperAdmin(uid: string) {
  const userDoc = await db.collection('users').doc(uid).get();
  if (!userDoc.exists || userDoc.data()?.role !== 'SUPER_ADMIN') {
    throw new HttpsError('permission-denied', 'Super Admin access required');
  }
  return userDoc.data();
}

async function createAuditLog(entry: Record<string, unknown>) {
  await db.collection('auditLogs').add({
    ...entry,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

// Create restaurant account (Super Admin only)
export const createRestaurant = onCall(async (request) => {
  const adminUser = await verifySuperAdmin(request.auth?.uid || '');
  const { name, slug, email, phone, city, plan, ownerEmail, ownerName, ownerPassword } = request.data;

  if (!name || !slug || !ownerEmail || !ownerPassword) {
    throw new HttpsError('invalid-argument', 'Missing required fields');
  }

  const restaurantRef = db.collection('restaurants').doc();
  const restaurantId = restaurantRef.id;

  await restaurantRef.set({
    restaurantId,
    name,
    slug,
    email: email || '',
    phone: phone || '',
    city: city || '',
    status: 'ACTIVE',
    subscriptionPlan: plan || 'BASIC',
    subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    settings: {
      theme: { primaryColor: '#10B981', secondaryColor: '#F9FAFB', accentColor: '#059669' },
      languages: ['fr', 'en', 'ar'],
      defaultLanguage: 'fr',
      taxes: [{ name: 'TVA', rate: 10 }],
      deliveryFee: 15,
      tableCount: 20,
      currency: 'MAD',
      notifications: { email: true, sms: true, push: true, sound: true },
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const ownerRecord = await admin.auth().createUser({
    email: ownerEmail,
    password: ownerPassword,
    displayName: ownerName || name,
  });

  await db.collection('users').doc(ownerRecord.uid).set({
    restaurantId,
    email: ownerEmail,
    name: ownerName || name,
    role: 'RESTAURANT_OWNER',
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await db.collection('subscriptions').add({
    restaurantId,
    plan: plan || 'BASIC',
    status: 'ACTIVE',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    amount: plan === 'PREMIUM' ? 499 : plan === 'BASIC' ? 199 : 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await createAuditLog({
    userId: request.auth!.uid,
    userName: adminUser?.name || 'Super Admin',
    action: 'CREATE',
    resource: 'restaurant',
    resourceId: restaurantId,
    details: { name, slug },
  });

  return { restaurantId, ownerId: ownerRecord.uid };
});

// Reset user password (Super Admin only)
export const resetUserPassword = onCall(async (request) => {
  await verifySuperAdmin(request.auth?.uid || '');
  const { userId, newPassword } = request.data;
  if (!userId || !newPassword) throw new HttpsError('invalid-argument', 'Missing fields');
  await admin.auth().updateUser(userId, { password: newPassword });
  return { success: true };
});

// Send notification on new order
export const onNewOrder = onDocumentCreated('orders/{orderId}', async (event) => {
  const order = event.data?.data();
  if (!order) return;

  const restaurantUsers = await db.collection('users')
    .where('restaurantId', '==', order.restaurantId)
    .where('role', 'in', ['RESTAURANT_OWNER', 'MANAGER', 'EMPLOYEE'])
    .get();

  const batch = db.batch();
  restaurantUsers.docs.forEach((userDoc) => {
    const notifRef = db.collection('notifications').doc();
    batch.set(notifRef, {
      restaurantId: order.restaurantId,
      userId: userDoc.id,
      type: 'NEW_ORDER',
      title: 'Nouvelle commande',
      message: `Commande ${order.orderNumber} reçue`,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const fcmToken = userDoc.data().fcmToken;
    if (fcmToken) {
      admin.messaging().send({
        token: fcmToken,
        notification: {
          title: 'Nouvelle commande',
          body: `Commande ${order.orderNumber} reçue`,
        },
        data: { orderId: event.params.orderId, type: 'NEW_ORDER' },
      }).catch(console.error);
    }
  });

  await batch.commit();
});

// Suspend restaurant
export const suspendRestaurant = onCall(async (request) => {
  await verifySuperAdmin(request.auth?.uid || '');
  const { restaurantId } = request.data;
  await db.collection('restaurants').doc(restaurantId).update({
    status: 'SUSPENDED',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { success: true };
});
