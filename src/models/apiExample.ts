import mongoose from 'mongoose';

const apiExampleSchema = new mongoose.Schema({
    companyId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    workspaceId: {
        type: String,
        required: true
    },
    itemId: {
        type: String,
        required: true
    },
    itemName: {
        type: String,
    },
    collectionId: {
        type: String,
        required: true
    },
    expiryDate: {
        type: String,
    },
    itemCatagory: {
        type: String,
    },
    parentId: {
        type: String
    },
    reqApiUrl: {
        type: String
    },
    requestData: {
        type: Object
    },
    responseData: {
        type: Object
    }

}, { timestamps: true });

// Compound indexes
// contrUsrLocRoleSchema.index({ companyId: 1, createdAt: -1 }); // Sorted by createdAt DESC
// contrUsrLocRoleSchema.index({ companyId: 1, contractor_id: 1 }); // For contractor_id lookups
// contrUsrLocRoleSchema.index({ companyId: 1, location_id: 1 }); // For location_id lookups
// contrUsrLocRoleSchema.index({ companyId: 1, roleName: 1 }); // For roleName lookups
// contrUsrLocRoleSchema.index({ companyId: 1, userId: 1 }); // For userId lookups

// Additional indexes
// contrUsrLocRoleSchema.index({ userId: 1, roleName: 1 });
// contrUsrLocRoleSchema.index({ userId: 1 });

const apiExample = mongoose.model('apiExample', apiExampleSchema, 'API_EXAMPLE');

export default apiExample;
