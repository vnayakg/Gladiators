const functions = require('firebase-functions')

// Firebase
const admin = require( 'firebase-admin');
admin.initializeApp(functions.config().firebase);


// Cloud Vision
const vision = require('@google-cloud/vision')
const visionClient = new vision.ImageAnnotatorClient();

// Dedicated bucket for cloud function invocation
const bucketName = 'quickcode-318508-vision';

const imageTagger = functions.storage

    .bucket(bucketName)
    .object()
    .onFinalize(async event => {

        // File data
        console.log(event)
        const object = event.data;
        const filePath = event.name;

        // Location of saved file in bucket
        const imageUri = `gs://${bucketName}/${filePath}`;

        // Firestore docID === file name
        const docId = filePath.split('.jpg')[0];

        const docRef = admin.firestore().collection('photos').doc(docId);

        // Await the cloud vision response
        const results = await visionClient.textDetection(imageUri);

        // Map the data to desired format
        const labels = results[0].fullTextAnnotation.text
        // const hotdog = labels.includes('hot dog')


        return docRef.set({ labels })


    });

    exports.imageTagger = imageTagger
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
