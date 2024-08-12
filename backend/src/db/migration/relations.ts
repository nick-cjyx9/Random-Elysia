import { relations } from "drizzle-orm/relations";
import { users, images } from "./schema";

export const imagesRelations = relations(images, ({one}) => ({
	user: one(users, {
		fields: [images.uid],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	images: many(images),
}));