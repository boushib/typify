import { Handler } from '@netlify/functions'
import { config as envConfig } from 'dotenv'
import fetch from 'node-fetch'

envConfig()

export const handler: Handler = async (event) => {
  try {
    const res = await fetch(
      `https://api.airtable.com/v0/app4hMMyTo2jkG0z9/Scores?maxRecords=10`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
          ContentType: 'application/json',
        },
      }
    )

    const data: any = await res.json()

    return {
      statusCode: 200,
      body: JSON.stringify(
        data.records.map(({ id, createdTime, fields }) => ({
          id,
          ...fields,
          createdAt: createdTime,
        }))
      ),
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify(err),
    }
  }
}
