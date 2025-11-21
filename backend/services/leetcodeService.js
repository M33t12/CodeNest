// ============================================
// LEETCODE API SERVICE
// ============================================

// services/leetcodeService.js
const axios = require('axios');

class LeetCodeService {
  constructor() {
    this.baseUrl = 'https://leetcode.com/graphql';
    this.headers = {
      'Content-Type': 'application/json',
      'Referer': 'https://leetcode.com'
    };
  }

  // Fetch all problems from LeetCode
  async fetchAllProblems() {
    const query = `
      query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
        problemsetQuestionList: questionList(
          categorySlug: $categorySlug
          limit: $limit
          skip: $skip
          filters: $filters
        ) {
          total: totalNum
          questions: data {
            acRate
            difficulty
            freqBar
            frontendQuestionId: questionFrontendId
            isFavor
            paidOnly: isPaidOnly
            status
            title
            titleSlug
            topicTags {
              name
              id
              slug
            }
            hasSolution
            hasVideoSolution
          }
        }
      }
    `;

    try {
      const response = await axios.post(this.baseUrl, {
        query,
        variables: {
          categorySlug: "",
          skip: 0,
          limit: 100,
          filters: {}
        }
      }, { headers: this.headers });

      if (!response.data?.data?.problemsetQuestionList?.questions) {
          throw new Error('Invalid or empty response from LeetCode API');
      }

      return response.data.data.problemsetQuestionList.questions;
    } catch (error) {
      console.log("ERROR :: leetcodeService.js :: LeetCodeService :: fetchAllProblems ",error);
      console.error('Error fetching LeetCode problems:', error.message);
      throw new Error('Failed to fetch problems from LeetCode');
    }
  }

  // Fetch problem details by slug
  async fetchProblemDetails(titleSlug) {
    const query = `
      query questionData($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          questionId
          questionFrontendId
          title
          titleSlug
          content
          difficulty
          likes
          dislikes
          topicTags {
            name
            slug
          }
          companyTagStats
          stats
          hints
          solution {
            id
            canSeeDetail
          }
          status
          sampleTestCase
          isPaidOnly
        }
      }
    `;

    try {
      const response = await axios.post(this.baseUrl, {
        query,
        variables: { titleSlug }
      }, { headers: this.headers });

      if (!response.data?.data?.question) {
          throw new Error('Invalid or empty response from LeetCode API');
      }

      return response.data.data.question;
    } catch (error) {
      console.log("ERROR :: leetcodeService.js :: LeetCodeService :: fetchProblemDetails ",error);
      console.error('Error fetching problem details:', error.message);
      throw new Error('Failed to fetch problem details');
    }
  }

  // Fetch problems by topic
  async fetchProblemsByTopic(topicSlug) {
    const query = `
      query problemsetQuestionList($categorySlug: String, $filters: QuestionListFilterInput) {
        problemsetQuestionList: questionList(
          categorySlug: $categorySlug
          filters: $filters
        ) {
          questions: data {
            frontendQuestionId: questionFrontendId
            title
            titleSlug
            difficulty
            topicTags {
              name
              slug
            }
          }
        }
      }
    `;

    try {
      const response = await axios.post(this.baseUrl, {
        query,
        variables: {
          categorySlug: "",
          filters: {
            tags: [topicSlug]
          }
        }
      }, { headers: this.headers });

      if (!response.data?.data?.problemsetQuestionList?.questions) {
          throw new Error('Invalid or empty response from LeetCode API');
      }

      return response.data.data.problemsetQuestionList.questions;
    } catch (error) {
      console.log("ERROR :: leetcodeService.js :: LeetCodeService :: fetchProblemsByTopic",error);
      console.error('Error fetching problems by topic:', error.message);
      throw new Error('Failed to fetch problems by topic');
    }
  }

  // Get daily challenge
  async getDailyChallenge() {
    const query = `
      query questionOfToday {
        activeDailyCodingChallengeQuestion {
          date
          link
          question {
            questionFrontendId
            title
            titleSlug
            difficulty
            topicTags {
              name
              slug
            }
          }
        }
      }
    `;



    try {
      const response = await axios.post(this.baseUrl, {
        query
      }, { headers: this.headers });

      if (!response.data?.data?.activeDailyCodingChallengeQuestion) {
          throw new Error('Invalid or empty response from LeetCode API');
      }
      return response.data.data.activeDailyCodingChallengeQuestion;
    } catch (error) {
      console.log("ERROR :: leetcodeService.js :: LeetCodeService :: getDailyChallenge ",error);
      console.error('Error fetching daily challenge:', error.message);
      throw new Error('Failed to fetch daily challenge');
    }
  }
}

module.exports = new LeetCodeService();
