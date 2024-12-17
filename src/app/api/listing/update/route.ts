import Listing from '../../../../lib/models/listing.model';
import { connect } from '../../../../lib/mongodb/mongoose';
import { currentUser } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
export const POST = async (req: NextRequest) => {
  const user = await currentUser();
  try {
    await connect();
    const data = await req.json();
    if (!user || user.publicMetadata.userMongoId !== data.userMongoId) {
      return new Response('Unauthorized', {
        status: 401,
      });
    }
    const newListing = await Listing.findByIdAndUpdate(
      data.listingId,
      {
        $set: {
          name: data.name,
          description: data.description,
          address: data.address,
          regularPrice: data.regularPrice,
          discountPrice: data.discountPrice,
          bathrooms: data.bathrooms,
          bedrooms: data.bedrooms,
          furnished: data.furnished,
          parking: data.parking,
          type: data.type,
          offer: data.offer,
          imageUrls: data.imageUrls,
        },
      },
      { new: true }
    );
    await newListing.save();
    return new Response(JSON.stringify(newListing), {
      status: 200,
    });
  } catch (error) {
    console.log('Error creating listing:', error);
    return new Response('Error creating listing', {
      status: 500,
    });
  }
};