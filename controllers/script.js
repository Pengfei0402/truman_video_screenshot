const User = require('../models/User');
const helpers = require('./helpers');
const _ = require('lodash');
const Script = require('../models/Script');
const moment = require('moment');

exports.getStaticVideo = async (req, res) => {
    try {
      console.log('Searching for video...');
      
      const defaultUser = {
        profile: {
          picture: '/profile_pictures/human.png',
          name: 'Viewer'
        }
      };
  
      const script = await Script.findOne({
        'picture': 'Education/education_3.mp4',
        'class': 'Education',
        'postID': 0
      })
      .populate({
        path: 'actor',
        select: 'username profile.name profile.picture profile.color'
      })
      .populate({
        path: 'comments',
        populate: {
          path: 'actor',
          select: 'username profile.name profile.picture profile.color'
        }
      })
      .exec();
  
      if (!script) {
        console.log('Video not found');
        return res.status(404).send('Video not found');
      }
  
      // Add video path prefix
      script.picture = '/post_pictures/' + script.picture;
      
      // Process comments with null check
      if (script.comments && script.comments.length > 0) {
        script.comments = script.comments.map(comment => {
          const commentObj = comment.toObject();
          return {
            ...commentObj,
            actor: {
              ...commentObj.actor,
              profile: {
                name: commentObj.actor?.profile?.name || commentObj.actor?.username || 'Anonymous',
                picture: '/profile_pictures/' + (commentObj.actor?.profile?.picture || 'human.png'),
                color: commentObj.actor?.profile?.color || '#f0f0f0'
              }
            }
          };
        });
      } else {
        script.comments = [];
      }
  
      res.render('StaticVideo', {
        script: script,
        user: defaultUser,
        title: 'Education Video',
        disabledFunctionalities: true
      });
  
    } catch (err) {
      console.log('Error:', err);
      res.status(500).send('Server error');
    }
  };

/**
 * GET /tutorial
 * Get list of posts for feed (tutorial section where postFunctionalities is disabled)
 */
exports.getScriptTutorial = async(req, res, next) => {
    try {
        const user = await User.findById(req.user.id).exec();
        // If the user is no longer active, sign the user out.
        if (!user.active) {
            req.logout((err) => {
                if (err) console.log('Error : Failed to logout.', err);
                req.session.destroy((err) => {
                    if (err) console.log('Error : Failed to destroy the session during logout.', err);
                    req.user = null;
                    req.flash('errors', { msg: 'Account is no longer active. Study is over.' });
                    res.redirect('/signup');
                });
            });
        }

        script_feed = await helpers.getTutorial(user);

        res.render('script', { script: script_feed, title: 'Feed', disabledFunctionalitiies: true });
    } catch (err) {
        next(err);
    }
}

/**
 * GET /
 * Get list of posts for feed
 */
exports.getScript = async(req, res, next) => {
    try {
        const user = await User.findById(req.user.id).exec();
        // If the user is no longer active, sign the user out.
        if (!user.active) {
            req.logout((err) => {
                if (err) console.log('Error : Failed to logout.', err);
                req.session.destroy((err) => {
                    if (err) console.log('Error : Failed to destroy the session during logout.', err);
                    req.user = null;
                    req.flash('errors', { msg: 'Account is no longer active. Study is over.' });
                    res.redirect('/signup');
                });
            });
        }

        const finalfeed = await helpers.getFeed(user);

        console.log("Script Size is: " + finalfeed.length);
        res.render('script', { script: finalfeed, title: 'Feed' });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /feed
 * Update user's actions on ACTOR posts. 
 */
exports.postUpdateFeedAction = async(req, res, next) => {
    try {
        const user = await User.findById(req.user.id).exec();
        // Find the object from the right post in feed
        let feedIndex = _.findIndex(user.feedAction, function(o) { return o.post == req.body.postID; });

        if (feedIndex == -1) {
            const cat = {
                post: req.body.postID,
                postClass: req.body.postClass,
            };
            // Add new post into correct location
            feedIndex = user.feedAction.push(cat) - 1;
        }
        // Create a new Comment
        if (req.body.new_comment) {
            user.numComments = user.numComments + 1;
            const cat = {
                new_comment: true,
                new_comment_id: user.numComments + 100,
                body: req.body.comment_text,
                relativeTime: req.body.new_comment - user.createdAt,
                absTime: req.body.new_comment,
                videoTime: req.body.videoTime,
                liked: false,
                unliked: false,
                flagged: false,
                shared: false,
                reply_to: req.body.reply_to,
                parent_comment: req.body.parent_comment
            }
            user.feedAction[feedIndex].comments.push(cat);
        }

        // Are we doing anything with a comment?
        else if (req.body.commentID) {
            const isUserComment = (req.body.isUserComment == 'true');
            let commentIndex = (isUserComment) ?
                _.findIndex(user.feedAction[feedIndex].comments, function(o) {
                    return o.new_comment_id == req.body.commentID && o.new_comment == isUserComment
                }) :
                _.findIndex(user.feedAction[feedIndex].comments, function(o) {
                    return o.comment == req.body.commentID && o.new_comment == isUserComment
                });
            //no comment in this post-actions yet
            if (commentIndex == -1) {
                const cat = {
                    comment: req.body.commentID
                };
                user.feedAction[feedIndex].comments.push(cat);
                commentIndex = user.feedAction[feedIndex].comments.length - 1;
            }

            // LIKE A COMMENT
            if (req.body.like) {
                let like = req.body.like;
                if (user.feedAction[feedIndex].comments[commentIndex].likeTime) {
                    user.feedAction[feedIndex].comments[commentIndex].likeTime.push(like);

                } else {
                    user.feedAction[feedIndex].comments[commentIndex].likeTime = [like];
                }
                user.feedAction[feedIndex].comments[commentIndex].liked = !user.feedAction[feedIndex].comments[commentIndex].liked;
                if (req.body.isUserComment != 'true') user.numCommentLikes++;
            }

            // UNLIKE A COMMENT
            if (req.body.unlike) {
                let unlike = req.body.unlike;
                if (user.feedAction[feedIndex].comments[commentIndex].unlikeTime) {
                    user.feedAction[feedIndex].comments[commentIndex].unlikeTime.push(unlike);
                } else {
                    user.feedAction[feedIndex].comments[commentIndex].unlikeTime = [unlike];
                }
                user.feedAction[feedIndex].comments[commentIndex].unliked = !user.feedAction[feedIndex].comments[commentIndex].unliked;
                if (req.body.isUserComment != 'true') user.numCommentLikes--;
            }

            // FLAG A COMMENT
            else if (req.body.flag) {
                let flag = req.body.flag;
                if (user.feedAction[feedIndex].comments[commentIndex].flagTime) {
                    user.feedAction[feedIndex].comments[commentIndex].flagTime.push(flag);

                } else {
                    user.feedAction[feedIndex].comments[commentIndex].flagTime = [flag];
                }
                user.feedAction[feedIndex].comments[commentIndex].flagged = true;
            }

            // UNFLAG A COMMENT
            else if (req.body.unflag) {
                let unflag = req.body.unflag;
                if (user.feedAction[feedIndex].comments[commentIndex].flagTime) {
                    user.feedAction[feedIndex].comments[commentIndex].flagTime.push(unflag);

                } else {
                    user.feedAction[feedIndex].comments[commentIndex].flagTime = [unflag];
                }
                user.feedAction[feedIndex].comments[commentIndex].flagged = false;
            }

            // SHARE A COMMENT 
            else if (req.body.share) {
                let share = req.body.share;
                if (user.feedAction[feedIndex].comments[commentIndex].shareTime) {
                    user.feedAction[feedIndex].comments[commentIndex].shareTime.push(share);

                } else {
                    user.feedAction[feedIndex].comments[commentIndex].shareTime = [share];
                }
                user.feedAction[feedIndex].comments[commentIndex].shared = true;
            }
        } // Not a comment-- Are we doing anything with the post?
        else {
            // Flag event
            if (req.body.flag) {
                let flag = req.body.flag;
                if (!user.feedAction[feedIndex].flagTime) {
                    user.feedAction[feedIndex].flagTime = [flag];
                } else {
                    user.feedAction[feedIndex].flagTime.push(flag);
                }
                user.feedAction[feedIndex].flagged = !user.feedAction[feedIndex].flagged;
            } // Like event
            else if (req.body.like) {
                let like = req.body.like;
                if (!user.feedAction[feedIndex].likeTime) {
                    user.feedAction[feedIndex].likeTime = [like];
                } else {
                    user.feedAction[feedIndex].likeTime.push(like);
                }
                user.feedAction[feedIndex].liked = !user.feedAction[feedIndex].liked;
            } // Unlike event
            else if (req.body.unlike) {
                let unlike = req.body.unlike;
                if (!user.feedAction[feedIndex].unlikeTime) {
                    user.feedAction[feedIndex].unlikeTime = [unlike];
                } else {
                    user.feedAction[feedIndex].unlikeTime.push(unlike);
                }
                user.feedAction[feedIndex].unliked = !user.feedAction[feedIndex].unliked;
            } // Share event 
            else if (req.body.share) {
                let share = req.body.share;
                if (!user.feedAction[feedIndex].shareTime) {
                    user.feedAction[feedIndex].shareTime = [share];
                } else {
                    user.feedAction[feedIndex].shareTime.push(share);
                }
                user.feedAction[feedIndex].shared = true;
            } // Read event: Not used.
            else if (req.body.viewed) {
                let view = req.body.viewed;
                if (!user.feedAction[feedIndex].readTime) {
                    user.feedAction[feedIndex].readTime = [view];
                } else {
                    user.feedAction[feedIndex].readTime.push(view);
                }
                user.feedAction[feedIndex].rereadTimes++;
                user.feedAction[feedIndex].mostRecentTime = Date.now();
            } // Video action (play, pause, seeking, seeked) 
            else if (req.body.videoAction) {
                user.feedAction[feedIndex].videoAction.push(req.body.videoAction);
            } // Video duration (array of time durations user viewed the video) 
            else if (req.body.videoDuration) {
                user.feedAction[feedIndex].videoDuration.push(req.body.videoDuration);
            } else {
                console.log(req.body);
                console.log('Something in feedAction went crazy. You should never see this.');
            }
        }
        await user.save();
        res.send({ result: "success", numComments: user.numComments });
    } catch (err) {
        next(err);
    }

};