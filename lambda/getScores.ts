import { Handler } from '@netlify/functions'
import { config as envConfig } from 'dotenv'
import fetch from 'node-fetch'

envConfig()

export const handler: Handler = async (event) => {
  try {
    const { AIRTABLE_API_URL, AIRTABLE_API_KEY } = process.env
    const res = await fetch(
      `${AIRTABLE_API_URL}/Scores?maxRecords=10&sort%5B0%5D%5Bfield%5D=score&sort%5B0%5D%5Bdirection%5D=desc`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
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
