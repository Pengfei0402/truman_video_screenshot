const User = require('../models/User');
const helpers = require('./helpers');
const _ = require('lodash');
const Script = require('../models/Script');

exports.getStaticVideo = async (req, res) => {
    try {
        const defaultUser = {
            profile: {
                picture: '/profile_pictures/human.png',
                name: 'Viewer',
                color: '#f0f0f0'
            }
        };

        const sideNote = "After you are done viewing the page, please **return to the survey page** to complete the survey.";

        const script = await Script.findOne({
            'postID': 0
            })
             .populate('actor')
             .populate('comments.actor')
             .populate('comments.subcomments.actor')
             .sort('-time')
            .lean()
            .exec();

        // Get URL parameters
        const moParam = req.query.mo;
        const emParam = req.query.em;
        const emSubParam = req.query.em_sub;
        const speakerParam = req.query.speaker;
        const offenseParam = req.query.offense; // 'rude' or 'hate'

        // Map parameters to class values for Study 2
        let targetClass;
        if (moParam !== undefined) {
            targetClass = `mo=${moParam}`; // mo=0 or mo=1
        } else if (emSubParam !== undefined) {
            targetClass = `em_sub=${emSubParam}`; // em_sub=0 or em_sub=1
        } else if (emParam !== undefined) {
            targetClass = `em=${emParam}`; // em=0 or em=1
        }

        // Filter offensive messages based on offense parameter
        let targetOffenseClass;
        if (offenseParam === 'rude') {
            targetOffenseClass = 'offense_rude';
        } else if (offenseParam === 'hate') {
            targetOffenseClass = 'offense_hate';
        } else {
            // Default to rude if no offense parameter specified
            targetOffenseClass = 'offense_rude';
        }

        // Filter and modify comments based on class and speaker
        if (script.comments?.length > 0) {
            script.comments = script.comments.map(comment => {
                // Determine which offensive comment to process based on offense parameter
                const targetOffenseCommentID = offenseParam === 'hate' ? 2 : 1;
                
                if (comment.commentID === targetOffenseCommentID) {
                    const filteredSubcomments = comment.subcomments.filter(sub => 
                        sub.class === targetClass
                    );

                    // Modify actor details based on speaker parameter
                    if (speakerParam === '2') {
                        filteredSubcomments.forEach(sub => {
                            if (sub.actor.username === 'op231') {
                                sub.actor.username = 'Vira (AI Assistant)';
                                sub.actor.profile.name = 'Vira (AI Assistant)';
                                sub.actor.profile.picture = 'ai.png';
                            }
                        });
                    } else if (speakerParam === '3') {
                        filteredSubcomments.forEach(sub => {
                            if (sub.actor.username === 'op231') {
                                sub.actor.assistedLabel = 'Assisted by Vira';
                            }
                        });
                    }

                    return {
                        ...comment,
                        subcomments: filteredSubcomments
                    };
                }
                return comment;
            });

            // Filter offensive comments based on offense parameter
            script.comments = script.comments.filter(comment => {
                // Keep all non-offensive comments (regular comments)
                if (!comment.class || (!comment.class.includes('offense'))) {
                    return true;
                }
                // Only show the selected offensive comment type
                return comment.class === targetOffenseClass;
            });

            // Also filter to only show comments relevant to the selected offense
            const targetOffenseCommentID = offenseParam === 'hate' ? 2 : 1;
            script.comments = script.comments.filter(comment => {
                // Keep the main post (commentID 0)
                if (comment.commentID === 0) {
                    return true;
                }
                // Keep regular comments (3, 4, etc.)
                if (!comment.class || (!comment.class.includes('offense'))) {
                    return true;
                }
                // Only keep the selected offensive comment
                return comment.commentID === targetOffenseCommentID;
            });
        }

        // Fix video path
        script.picture = '/post_pictures/' + script.picture;

        // Debug logging
        console.log('Comments:', JSON.stringify(script.comments.map(c => ({
            id: c.commentID,
            hasReplies: Boolean(c.subcomments?.length),
            replyCount: c.subcomments?.length || 0,
            body: c.body?.substring(0, 30)
        })), null, 2));

        // Process comments with proper actor data for subcomments
        if (script.comments?.length > 0) {
            script.comments = script.comments.map(comment => ({
                ...comment,
                actor: processActor(comment.actor),
                subcomments: (comment.subcomments || []).map(sub => ({
                    ...sub,
                    actor: processActor(sub.actor)
                }))
            }));
        }

        // Helper function to process actor data
        function processActor(actor) {
            return {
                ...actor,
                profile: {
                    name: actor?.profile?.name || actor?.username,
                    picture: '/profile_pictures/' + (actor?.profile?.picture || 'human.png'),
                    color: actor?.profile?.color || '#f0f0f0'
                }
            };
        }

        // After comment processing:
        console.log('Processed Comments:', JSON.stringify(script.comments.map(c => ({
            id: c.commentID,
            body: c.body?.substring(0, 30),
            subcomments: c.subcomments?.map(s => ({
                id: s.commentID,
                body: s.body?.substring(0, 30)
            }))
        })), null, 2));

        res.render('StaticVideo', {
            script,
            user: defaultUser,
            title: 'Education Video',
            disabledFunctionalities: true,
            sideNote
        });

    } catch (err) {
        console.error('Error:', err);
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

        res.render('script', { script: script_feed, title: 'Feed', disabledFunctionalities: true });
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