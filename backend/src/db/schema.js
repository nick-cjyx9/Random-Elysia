"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageRelations = exports.usersRelations = exports.images = exports.users = void 0;
var sqlite_core_1 = require("drizzle-orm/sqlite-core");
var drizzle_orm_1 = require("drizzle-orm");
exports.users = (0, sqlite_core_1.sqliteTable)('users', {
    id: (0, sqlite_core_1.integer)('id').unique(),
    username: (0, sqlite_core_1.text)('username').notNull(),
    avatar: (0, sqlite_core_1.text)('avatar'),
    createdAt: (0, sqlite_core_1.text)('created_at').default((0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))).notNull(),
    // role: 0 -> admin, 1 -> normal uploader, 2 -> banned
    role: (0, sqlite_core_1.integer)('role').default(1).notNull(),
});
exports.images = (0, sqlite_core_1.sqliteTable)('images', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    link: (0, sqlite_core_1.text)('link').notNull(),
    del_link: (0, sqlite_core_1.text)('del_link').notNull(),
    likes: (0, sqlite_core_1.integer)('likes').notNull().default(0),
    dislikes: (0, sqlite_core_1.integer)('dislikes').notNull().default(0),
    tags: (0, sqlite_core_1.text)('tags'),
    createdAt: (0, sqlite_core_1.text)('created_at').default((0, drizzle_orm_1.sql)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))).notNull(),
    uid: (0, sqlite_core_1.integer)('uid').references(function () { return exports.users.id; }).notNull(),
});
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, function (_a) {
    var many = _a.many;
    return ({
        images: many(exports.images),
    });
});
exports.imageRelations = (0, drizzle_orm_1.relations)(exports.images, function (_a) {
    var one = _a.one;
    return ({
        user: one(exports.users, {
            fields: [exports.images.uid],
            references: [exports.users.id],
        }),
    });
});
var templateObject_1, templateObject_2;
